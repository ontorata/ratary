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
}): import('../types/memory.js').Memory {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags) as string[];
    if (!Array.isArray(tags)) tags = [];
  } catch {
    tags = [];
  }

  return {
    id: row.id,
    title: row.title,
    project: row.project,
    content: row.content,
    summary: row.summary,
    tags,
    favorite: row.favorite === 1,
    archived: row.archived === 1,
    ownerId: row.owner_id ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function tagsToJson(tags: string[]): string {
  return JSON.stringify(tags);
}
