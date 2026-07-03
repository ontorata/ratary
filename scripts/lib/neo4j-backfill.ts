import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';

export interface Neo4jRelationRow {
  source_memory_id: string;
  target_memory_id: string;
  relation: string;
  owner_id: string;
}

export interface Neo4jGraphWriter {
  ensureSchema(dryRun: boolean): Promise<void>;
  mergeRelation(row: Neo4jRelationRow): Promise<void>;
}

export interface Neo4jBackfillResult {
  scanned: number;
  merged: number;
  failed: number;
  dryRun: boolean;
}

export interface Neo4jBackfillOptions {
  source: ISqlDatabase;
  writer: Neo4jGraphWriter;
  ownerId?: string;
  batchSize: number;
  dryRun: boolean;
}

export async function backfillNeo4j(options: Neo4jBackfillOptions): Promise<Neo4jBackfillResult> {
  const result: Neo4jBackfillResult = {
    scanned: 0,
    merged: 0,
    failed: 0,
    dryRun: options.dryRun,
  };

  await options.writer.ensureSchema(options.dryRun);

  const owners = options.ownerId
    ? [{ owner_id: options.ownerId }]
    : await options.source.query<{ owner_id: string }>(
        `SELECT DISTINCT owner_id FROM memory_relations WHERE owner_id != ?`,
        [''],
      );

  for (const { owner_id: ownerId } of owners) {
    let offset = 0;
    while (true) {
      const rows = await fetchRelationBatch(options.source, ownerId, options.batchSize, offset);
      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        result.scanned++;
        if (options.dryRun) {
          result.merged++;
          continue;
        }

        try {
          await options.writer.mergeRelation(row);
          result.merged++;
        } catch {
          result.failed++;
        }
      }

      offset += rows.length;
      if (rows.length < options.batchSize) {
        break;
      }
    }
  }

  return result;
}

async function fetchRelationBatch(
  source: ISqlDatabase,
  ownerId: string,
  batchSize: number,
  offset: number,
): Promise<Neo4jRelationRow[]> {
  return source.query<Neo4jRelationRow>(
    `SELECT source_memory_id, target_memory_id, relation, owner_id
     FROM memory_relations
     WHERE owner_id = ?
     ORDER BY id
     LIMIT ? OFFSET ?`,
    [ownerId, batchSize, offset],
  );
}

export const NEO4J_MERGE_RELATION_CYPHER = `
MERGE (source:Memory {memory_id: $sourceMemoryId, owner_id: $ownerId})
MERGE (target:Memory {memory_id: $targetMemoryId, owner_id: $ownerId})
MERGE (source)-[rel:RELATES_TO {relation: $relation}]->(target)
`;
