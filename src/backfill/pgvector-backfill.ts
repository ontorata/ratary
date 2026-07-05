import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IVectorStore } from '../ports/vector/ivector-store.port.js';
import {
  PGVECTOR_EXTENSION_SQL,
  PGVECTOR_MEMORY_VECTORS_DDL,
} from '../infrastructure/vector/pgvector/pgvector.schema.js';

export interface PgvectorEmbeddingSourceRow {
  id: string;
  memory_id: string;
  owner_id: string;
  workspace_id: string | null;
  model_id: string;
  dimensions: number;
  vector_json: string;
  content_hash: string;
  created_at: string;
  updated_at: string;
}

export interface PgvectorBackfillResult {
  scanned: number;
  upserted: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
}

export interface PgvectorBackfillOptions {
  source: ISqlDatabase;
  vectorStore: IVectorStore;
  ownerId?: string;
  batchSize: number;
  dryRun: boolean;
  ensureSchema?: (target: ISqlDatabase) => Promise<void>;
  target?: ISqlDatabase;
}

export async function ensurePgvectorSchema(target: ISqlDatabase): Promise<void> {
  await target.execute(PGVECTOR_EXTENSION_SQL);
  for (const statement of splitSqlStatements(PGVECTOR_MEMORY_VECTORS_DDL)) {
    await target.execute(statement);
  }
}

export async function backfillPgvector(options: PgvectorBackfillOptions): Promise<PgvectorBackfillResult> {
  const result: PgvectorBackfillResult = {
    scanned: 0,
    upserted: 0,
    skipped: 0,
    failed: 0,
    dryRun: options.dryRun,
  };

  if (!options.dryRun && options.ensureSchema && options.target) {
    await options.ensureSchema(options.target);
  }

  const owners = options.ownerId
    ? [{ owner_id: options.ownerId }]
    : await options.source.query<{ owner_id: string }>(
        `SELECT DISTINCT owner_id FROM memory_embeddings WHERE owner_id != ?`,
        [''],
      );

  for (const { owner_id: ownerId } of owners) {
    let offset = 0;
    while (true) {
      const rows = await fetchEmbeddingBatch(options.source, ownerId, options.batchSize, offset);
      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        result.scanned++;
        try {
          if (options.dryRun) {
            continue;
          }

          const vector = JSON.parse(row.vector_json) as number[];
          const scope = {
            ownerId: row.owner_id,
            workspaceId: row.workspace_id ?? undefined,
          };

          const existing = await options.vectorStore.findByMemoryId(
            row.memory_id,
            scope,
            row.model_id,
          );
          if (existing?.contentHash === row.content_hash) {
            result.skipped++;
            continue;
          }

          await options.vectorStore.upsert({
            memoryId: row.memory_id,
            scope,
            modelId: row.model_id,
            dimensions: row.dimensions,
            vector,
            contentHash: row.content_hash,
          });
          result.upserted++;
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

  if (options.dryRun) {
    result.upserted = result.scanned - result.failed;
  }

  return result;
}

async function fetchEmbeddingBatch(
  source: ISqlDatabase,
  ownerId: string,
  batchSize: number,
  offset: number,
): Promise<PgvectorEmbeddingSourceRow[]> {
  return source.query<PgvectorEmbeddingSourceRow>(
    `SELECT e.id, e.memory_id, e.owner_id, m.workspace_id, e.model_id, e.dimensions,
            e.vector_json, e.content_hash, e.created_at, e.updated_at
     FROM memory_embeddings e
     LEFT JOIN memories m ON m.id = e.memory_id
     WHERE e.owner_id = ?
     ORDER BY e.id
     LIMIT ? OFFSET ?`,
    [ownerId, batchSize, offset],
  );
}

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}
