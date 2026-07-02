import { randomUUID } from 'node:crypto';

export function generateId(): string {
  return randomUUID();
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function rowToMemory(row: {
  id: string;
  title: string;
  project: string;
  content: string;
  summary: string;
  tags: string;
  favorite: number;
  archived: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  codename?: string | null;
  slug?: string | null;
  keywords?: string;
  category?: string;
  memory_type?: string;
  importance?: number;
  language?: string;
  notes?: string;
  project_id?: string;
  level?: string;
  last_accessed?: string | null;
  access_count?: number;
  embedding_id?: string | null;
  object_key?: string | null;
  semantic_hash?: string | null;
}): import('../types/memory.js').Memory {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags) as string[];
    if (!Array.isArray(tags)) tags = [];
  } catch {
    tags = [];
  }

  let keywords: string[] = [];
  try {
    keywords = JSON.parse(row.keywords ?? '[]') as string[];
    if (!Array.isArray(keywords)) keywords = [];
  } catch {
    keywords = [];
  }

  return {
    id: row.id,
    codename: row.codename ?? null,
    slug: row.slug ?? null,
    title: row.title,
    project: row.project,
    content: row.content,
    summary: row.summary,
    keywords,
    category: row.category ?? '',
    memoryType: row.memory_type ?? 'note',
    importance: row.importance ?? 50,
    language: row.language ?? 'id',
    notes: row.notes ?? '',
    tags,
    favorite: row.favorite === 1,
    archived: row.archived === 1,
    ownerId: row.owner_id ?? '',
    projectId: row.project_id ?? '',
    level: (row.level as import('../types/memory-level.js').MemoryLevel) ?? 'note',
    lastAccessed: row.last_accessed ?? null,
    accessCount: row.access_count ?? 0,
    embeddingId: row.embedding_id ?? null,
    objectKey: row.object_key ?? null,
    semanticHash: row.semantic_hash ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function tagsToJson(tags: string[]): string {
  return JSON.stringify(tags);
}

export function keywordsToJson(keywords: string[]): string {
  return JSON.stringify(keywords);
}
