import { z } from 'zod';
import { knowledgeMetadataSchema, memoryTypeSchema } from './knowledge.js';
import { MEMORY_LEVELS, type MemoryLevel } from './memory-level.js';

export { MEMORY_LEVELS, DEFAULT_MEMORY_LEVEL } from './memory-level.js';
export type { MemoryLevel } from './memory-level.js';

export const memoryRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  project: z.string(),
  content: z.string(),
  summary: z.string(),
  tags: z.string(),
  favorite: z.number().int().min(0).max(1),
  archived: z.number().int().min(0).max(1),
  owner_id: z.string().default(''),
  created_at: z.string(),
  updated_at: z.string(),
  codename: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  keywords: z.string().optional(),
  category: z.string().optional(),
  memory_type: z.string().optional(),
  importance: z.number().int().optional(),
  language: z.string().optional(),
  notes: z.string().optional(),
  project_id: z.string().optional(),
  level: z.enum(MEMORY_LEVELS).optional(),
  last_accessed: z.string().nullable().optional(),
  access_count: z.number().int().optional(),
  embedding_id: z.string().nullable().optional(),
  object_key: z.string().nullable().optional(),
  semantic_hash: z.string().nullable().optional(),
});

export type MemoryRow = z.infer<typeof memoryRowSchema>;

export interface Memory {
  id: string;
  codename: string | null;
  slug: string | null;
  title: string;
  project: string;
  content: string;
  summary: string;
  keywords: string[];
  category: string;
  memoryType: string;
  importance: number;
  language: string;
  notes: string;
  tags: string[];
  favorite: boolean;
  archived: boolean;
  ownerId: string;
  projectId: string;
  level: MemoryLevel;
  lastAccessed: string | null;
  accessCount: number;
  embeddingId: string | null;
  objectKey: string | null;
  semanticHash: string | null;
  createdAt: string;
  updatedAt: string;
}

const SUMMARY_MAX = 300;

export const createMemorySchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(500),
    project: z.string().max(200).default(''),
    content: z.string().min(1, 'Content is required'),
    summary: z.string().max(SUMMARY_MAX).default(''),
    tags: z.array(z.string().max(100)).max(50).default([]),
    favorite: z.boolean().default(false),
  })
  .merge(knowledgeMetadataSchema);

export const updateMemorySchema = createMemorySchema.partial();

export const listMemoriesQuerySchema = z.object({
  project: z.string().optional(),
  favorite: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  archived: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  project: z.string().optional(),
  category: z.string().optional(),
  memory_type: memoryTypeSchema.optional(),
  importance_min: z.coerce.number().int().min(0).max(100).optional(),
  favorite: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  archived: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? false : v === 'true')),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const backupImportSchema = z.object({
  memories: z.array(
    z.object({
      id: z.string().uuid().optional(),
      title: z.string().min(1),
      project: z.string().default(''),
      content: z.string().min(1),
      summary: z.string().default(''),
      tags: z.array(z.string()).default([]),
      favorite: z.boolean().default(false),
      archived: z.boolean().default(false),
      created_at: z.string().optional(),
      updated_at: z.string().optional(),
    }),
  ),
});

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type UpdateMemoryInput = z.infer<typeof updateMemorySchema>;
export type ListMemoriesQuery = z.infer<typeof listMemoriesQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type BackupImportInput = z.infer<typeof backupImportSchema>;

export type { MemoryScope } from './memory-scope.js';
