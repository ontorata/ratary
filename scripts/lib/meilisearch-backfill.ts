import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';

export interface MeilisearchMemoryDocument {
  id: string;
  owner_id: string;
  workspace_id: string;
  project_id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
}

export interface MeilisearchIndexWriter {
  ensureIndex(index: string, dryRun: boolean): Promise<void>;
  upsertDocuments(index: string, documents: MeilisearchMemoryDocument[]): Promise<void>;
}

export interface MeilisearchBackfillResult {
  scanned: number;
  indexed: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
}

export interface MeilisearchBackfillOptions {
  source: ISqlDatabase;
  writer: MeilisearchIndexWriter;
  index: string;
  ownerId?: string;
  batchSize: number;
  dryRun: boolean;
}

interface MemorySearchRow {
  id: string;
  owner_id: string;
  workspace_id: string | null;
  project_id: string;
  title: string;
  content: string;
  summary: string;
  tags: string;
}

export async function backfillMeilisearch(
  options: MeilisearchBackfillOptions,
): Promise<MeilisearchBackfillResult> {
  const result: MeilisearchBackfillResult = {
    scanned: 0,
    indexed: 0,
    skipped: 0,
    failed: 0,
    dryRun: options.dryRun,
  };

  await options.writer.ensureIndex(options.index, options.dryRun);

  const owners = options.ownerId
    ? [{ owner_id: options.ownerId }]
    : await options.source.query<{ owner_id: string }>(
        `SELECT DISTINCT owner_id FROM memories WHERE owner_id != ? AND archived = 0`,
        [''],
      );

  for (const { owner_id: ownerId } of owners) {
    let offset = 0;
    while (true) {
      const rows = await fetchMemoryBatch(options.source, ownerId, options.batchSize, offset);
      if (rows.length === 0) {
        break;
      }

      const documents = rows.map(toMeilisearchDocument);
      result.scanned += documents.length;

      if (options.dryRun) {
        result.indexed += documents.length;
      } else {
        try {
          await options.writer.upsertDocuments(options.index, documents);
          result.indexed += documents.length;
        } catch {
          result.failed += documents.length;
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

async function fetchMemoryBatch(
  source: ISqlDatabase,
  ownerId: string,
  batchSize: number,
  offset: number,
): Promise<MemorySearchRow[]> {
  return source.query<MemorySearchRow>(
    `SELECT id, owner_id, workspace_id, project_id, title, content, summary, tags
     FROM memories
     WHERE owner_id = ? AND archived = 0
     ORDER BY id
     LIMIT ? OFFSET ?`,
    [ownerId, batchSize, offset],
  );
}

function toMeilisearchDocument(row: MemorySearchRow): MeilisearchMemoryDocument {
  return {
    id: row.id,
    owner_id: row.owner_id,
    workspace_id: row.workspace_id ?? '',
    project_id: row.project_id,
    title: row.title,
    content: row.content,
    summary: row.summary,
    tags: parseTags(row.tags),
  };
}

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export const MEILISEARCH_INDEX_SETTINGS = {
  filterableAttributes: ['owner_id', 'workspace_id', 'project_id'],
  searchableAttributes: ['title', 'content', 'summary', 'tags'],
};
