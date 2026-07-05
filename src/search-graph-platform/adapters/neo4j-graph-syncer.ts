import neo4j from 'neo4j-driver';
import type { Env } from '../../config/env.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import { NEO4J_GRAPH_DDL } from '../../infrastructure/graph/neo4j/neo4j-graph-store.adapter.js';
import {
  backfillNeo4j,
  NEO4J_MERGE_RELATION_CYPHER,
  type Neo4jGraphWriter,
  type Neo4jRelationRow,
} from '../../backfill/neo4j-backfill.js';
import type { IGraphIndexSyncer } from '../ports/igraph-index-syncer.port.js';
import type { SearchGraphSyncInput, SearchGraphSyncStats } from '../types/sync.types.js';

function createNeo4jWriter(uri: string, username: string, password: string): Neo4jGraphWriter {
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session();

  return {
    async ensureSchema(dryRun) {
      if (dryRun) return;
      for (const statement of NEO4J_GRAPH_DDL.split(';')
        .map((s) => s.trim())
        .filter(Boolean)) {
        await session.run(statement);
      }
    },
    async mergeRelation(row: Neo4jRelationRow) {
      await session.run(NEO4J_MERGE_RELATION_CYPHER, {
        sourceMemoryId: row.source_memory_id,
        targetMemoryId: row.target_memory_id,
        relation: row.relation,
        ownerId: row.owner_id,
      });
    },
  };
}

/** Neo4j production graph sync adapter (Phase 21B). */
export class Neo4jGraphIndexSyncer implements IGraphIndexSyncer {
  constructor(
    private readonly sql: ISqlDatabase,
    private readonly env: Env,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.env.NEO4J_URI && this.env.NEO4J_USERNAME && this.env.NEO4J_PASSWORD);
  }

  async sync(input: SearchGraphSyncInput): Promise<SearchGraphSyncStats> {
    if (!this.isConfigured()) {
      throw new Error('NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD are required for graph sync');
    }

    const dryRun = input.dryRun ?? false;
    const batchSize = input.batchSize ?? 100;
    const writer = createNeo4jWriter(
      this.env.NEO4J_URI!,
      this.env.NEO4J_USERNAME!,
      this.env.NEO4J_PASSWORD!,
    );

    if (input.mode === 'full') {
      const result = await backfillNeo4j({
        source: this.sql,
        writer,
        ownerId: input.ownerId,
        batchSize,
        dryRun,
      });
      return {
        scanned: result.scanned,
        applied: result.merged,
        skipped: 0,
        failed: result.failed,
        dryRun: result.dryRun,
      };
    }

    return this.syncIncremental(writer, input, dryRun, batchSize);
  }

  private async syncIncremental(
    writer: Neo4jGraphWriter,
    input: SearchGraphSyncInput,
    dryRun: boolean,
    batchSize: number,
  ): Promise<SearchGraphSyncStats> {
    const stats: SearchGraphSyncStats = {
      scanned: 0,
      applied: 0,
      skipped: 0,
      failed: 0,
      dryRun,
    };

    await writer.ensureSchema(dryRun);

    const owners = input.ownerId
      ? [{ owner_id: input.ownerId }]
      : await this.sql.query<{ owner_id: string }>(
          `SELECT DISTINCT owner_id FROM memory_relations WHERE owner_id != ?`,
          [''],
        );

    for (const { owner_id: ownerId } of owners) {
      let offset = 0;
      while (true) {
        const rows = await this.fetchRelationBatch(
          ownerId,
          batchSize,
          offset,
          input.sinceWatermark,
        );
        if (rows.length === 0) break;

        for (const row of rows) {
          stats.scanned++;
          if (dryRun) {
            stats.applied++;
            continue;
          }
          try {
            await writer.mergeRelation(row);
            stats.applied++;
          } catch {
            stats.failed++;
          }
        }

        offset += rows.length;
        if (rows.length < batchSize) break;
      }
    }

    return stats;
  }

  private async fetchRelationBatch(
    ownerId: string,
    batchSize: number,
    offset: number,
    sinceCreatedAt?: string,
  ): Promise<Neo4jRelationRow[]> {
    if (sinceCreatedAt) {
      return this.sql.query<Neo4jRelationRow>(
        `SELECT source_memory_id, target_memory_id, relation, owner_id
         FROM memory_relations
         WHERE owner_id = ? AND created_at > ?
         ORDER BY created_at, id
         LIMIT ? OFFSET ?`,
        [ownerId, sinceCreatedAt, batchSize, offset],
      );
    }

    return this.sql.query<Neo4jRelationRow>(
      `SELECT source_memory_id, target_memory_id, relation, owner_id
       FROM memory_relations
       WHERE owner_id = ?
       ORDER BY created_at, id
       LIMIT ? OFFSET ?`,
      [ownerId, batchSize, offset],
    );
  }
}

export class NoOpGraphIndexSyncer implements IGraphIndexSyncer {
  isConfigured(): boolean {
    return false;
  }

  async sync(): Promise<SearchGraphSyncStats> {
    throw new Error('Search graph platform disabled');
  }
}
