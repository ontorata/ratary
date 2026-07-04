import { Meilisearch } from 'meilisearch';
import type { Env } from '../../config/env.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import {
  backfillMeilisearch,
  MEILISEARCH_INDEX_SETTINGS,
  type MeilisearchIndexWriter,
  type MeilisearchMemoryDocument,
} from '../../../scripts/lib/meilisearch-backfill.js';
import type { ISearchIndexSyncer } from '../ports/isearch-index-syncer.port.js';
import type { SearchGraphSyncInput, SearchGraphSyncStats } from '../types/sync.types.js';

interface MemorySearchRow {
  id: string;
  owner_id: string;
  workspace_id: string | null;
  project_id: string;
  title: string;
  content: string;
  summary: string;
  tags: string;
  updated_at: string;
}

function createMeilisearchWriter(client: Meilisearch): MeilisearchIndexWriter {
  return {
    async ensureIndex(index, dryRun) {
      if (dryRun) return;
      await client.createIndex(index, { primaryKey: 'id' }).catch(() => undefined);
      await client.index(index).updateSettings(MEILISEARCH_INDEX_SETTINGS);
    },
    async upsertDocuments(index, documents) {
      await client.index(index).addDocuments(documents);
    },
  };
}

function toDocument(row: MemorySearchRow): MeilisearchMemoryDocument {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(row.tags) as unknown;
    tags = Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    tags = [];
  }
  return {
    id: row.id,
    owner_id: row.owner_id,
    workspace_id: row.workspace_id ?? '',
    project_id: row.project_id,
    title: row.title,
    content: row.content,
    summary: row.summary,
    tags,
  };
}

/** Meilisearch production sync adapter (Phase 21A). */
export class MeilisearchIndexSyncer implements ISearchIndexSyncer {
  constructor(
    private readonly sql: ISqlDatabase,
    private readonly env: Env,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.env.MEILISEARCH_HOST && this.env.MEILISEARCH_INDEX);
  }

  async sync(input: SearchGraphSyncInput): Promise<SearchGraphSyncStats> {
    if (!this.isConfigured()) {
      throw new Error('MEILISEARCH_HOST and MEILISEARCH_INDEX are required for search sync');
    }

    const dryRun = input.dryRun ?? false;
    const batchSize = input.batchSize ?? 100;
    const client = new Meilisearch({
      host: this.env.MEILISEARCH_HOST!,
      apiKey: this.env.MEILISEARCH_API_KEY,
    });
    const writer = createMeilisearchWriter(client);
    const index = this.env.MEILISEARCH_INDEX!;

    if (input.mode === 'full') {
      const result = await backfillMeilisearch({
        source: this.sql,
        writer,
        index,
        ownerId: input.ownerId,
        batchSize,
        dryRun,
      });
      return {
        scanned: result.scanned,
        applied: result.indexed,
        skipped: result.skipped,
        failed: result.failed,
        dryRun: result.dryRun,
      };
    }

    return this.syncIncremental(writer, index, input, dryRun, batchSize);
  }

  private async syncIncremental(
    writer: MeilisearchIndexWriter,
    index: string,
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

    await writer.ensureIndex(index, dryRun);

    const owners = input.ownerId
      ? [{ owner_id: input.ownerId }]
      : await this.sql.query<{ owner_id: string }>(
          `SELECT DISTINCT owner_id FROM memories WHERE owner_id != ? AND archived = 0`,
          [''],
        );

    const watermark = input.sinceWatermark;

    for (const { owner_id: ownerId } of owners) {
      let offset = 0;
      while (true) {
        const rows = await this.fetchIncrementalBatch(ownerId, batchSize, offset, watermark);
        if (rows.length === 0) break;

        const documents = rows.map(toDocument);
        stats.scanned += documents.length;

        if (dryRun) {
          stats.applied += documents.length;
        } else {
          try {
            await writer.upsertDocuments(index, documents);
            stats.applied += documents.length;
          } catch {
            stats.failed += documents.length;
          }
        }

        offset += rows.length;
        if (rows.length < batchSize) break;
      }
    }

    return stats;
  }

  private async fetchIncrementalBatch(
    ownerId: string,
    batchSize: number,
    offset: number,
    sinceUpdatedAt?: string,
  ): Promise<MemorySearchRow[]> {
    if (sinceUpdatedAt) {
      return this.sql.query<MemorySearchRow>(
        `SELECT id, owner_id, workspace_id, project_id, title, content, summary, tags, updated_at
         FROM memories
         WHERE owner_id = ? AND archived = 0 AND updated_at > ?
         ORDER BY updated_at, id
         LIMIT ? OFFSET ?`,
        [ownerId, sinceUpdatedAt, batchSize, offset],
      );
    }

    return this.sql.query<MemorySearchRow>(
      `SELECT id, owner_id, workspace_id, project_id, title, content, summary, tags, updated_at
       FROM memories
       WHERE owner_id = ? AND archived = 0
       ORDER BY updated_at, id
       LIMIT ? OFFSET ?`,
      [ownerId, batchSize, offset],
    );
  }
}

export class NoOpSearchIndexSyncer implements ISearchIndexSyncer {
  isConfigured(): boolean {
    return false;
  }

  async sync(): Promise<SearchGraphSyncStats> {
    throw new Error('Search graph platform disabled');
  }
}
