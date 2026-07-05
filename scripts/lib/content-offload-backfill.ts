import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';
import type { IObjectStorage } from '../../src/ports/storage/iobject-storage.port.js';

export interface ContentOffloadMemoryRow {
  id: string;
  owner_id: string;
  workspace_id: string | null;
  content: string;
  object_key: string | null;
  updated_at: string;
}

export interface ContentOffloadBackfillResult {
  scanned: number;
  offloaded: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
}

export interface ContentOffloadBackfillOptions {
  source: ISqlDatabase;
  objectStorage: IObjectStorage;
  minBytes: number;
  ownerId?: string;
  batchSize: number;
  dryRun: boolean;
  clearInline?: boolean;
  sinceUpdatedAt?: string;
}

export async function backfillContentOffload(
  options: ContentOffloadBackfillOptions,
): Promise<ContentOffloadBackfillResult> {
  const result: ContentOffloadBackfillResult = {
    scanned: 0,
    offloaded: 0,
    skipped: 0,
    failed: 0,
    dryRun: options.dryRun,
  };

  const owners = options.ownerId
    ? [{ owner_id: options.ownerId }]
    : await options.source.query<{ owner_id: string }>(
        `SELECT DISTINCT owner_id FROM memories WHERE owner_id != ? AND archived = 0`,
        [''],
      );

  for (const { owner_id: ownerId } of owners) {
    let offset = 0;
    while (true) {
      const rows = await fetchMemoryBatch(
        options.source,
        ownerId,
        options.batchSize,
        offset,
        options.sinceUpdatedAt,
      );
      if (rows.length === 0) break;

      for (const row of rows) {
        result.scanned++;
        const byteLength = Buffer.byteLength(row.content, 'utf8');

        if (row.object_key) {
          result.skipped++;
          continue;
        }

        if (byteLength < options.minBytes) {
          result.skipped++;
          continue;
        }

        if (options.dryRun) {
          result.offloaded++;
          continue;
        }

        try {
          const objectKey = buildObjectKey(row);
          const key = { segments: objectKey.split('/') };
          await options.objectStorage.put(
            key,
            row.content,
            { contentType: 'text/markdown; charset=utf-8', contentLength: byteLength },
          );

          const stored = await options.objectStorage.get(key);
          if (!stored || stored.body.length === 0) {
            result.failed++;
            continue;
          }

          const storedText = Buffer.from(stored.body).toString('utf8');
          if (storedText !== row.content) {
            await options.objectStorage.delete(key).catch(() => undefined);
            result.failed++;
            continue;
          }

          await options.source.execute(
            `UPDATE memories SET object_key = ?, updated_at = updated_at WHERE id = ? AND owner_id = ?`,
            [objectKey, row.id, row.owner_id],
          );
          if (options.clearInline) {
            await options.source.execute(
              `UPDATE memories SET content = '', updated_at = updated_at WHERE id = ? AND owner_id = ?`,
              [row.id, row.owner_id],
            );
          }
          result.offloaded++;
        } catch {
          result.failed++;
        }
      }

      offset += rows.length;
      if (rows.length < options.batchSize) break;
    }
  }

  return result;
}

function buildObjectKey(row: ContentOffloadMemoryRow): string {
  const workspace = row.workspace_id ?? 'default';
  return `${row.owner_id}/${workspace}/${row.id}/content`;
}

async function fetchMemoryBatch(
  source: ISqlDatabase,
  ownerId: string,
  batchSize: number,
  offset: number,
  sinceUpdatedAt?: string,
): Promise<ContentOffloadMemoryRow[]> {
  if (sinceUpdatedAt) {
    return source.query<ContentOffloadMemoryRow>(
      `SELECT id, owner_id, workspace_id, content, object_key, updated_at
       FROM memories
       WHERE owner_id = ? AND archived = 0 AND updated_at > ?
       ORDER BY updated_at, id
       LIMIT ? OFFSET ?`,
      [ownerId, sinceUpdatedAt, batchSize, offset],
    );
  }

  return source.query<ContentOffloadMemoryRow>(
    `SELECT id, owner_id, workspace_id, content, object_key, updated_at
     FROM memories
     WHERE owner_id = ? AND archived = 0
     ORDER BY updated_at, id
     LIMIT ? OFFSET ?`,
    [ownerId, batchSize, offset],
  );
}
