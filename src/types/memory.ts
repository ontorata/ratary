import { z } from 'zod';

export const memoryRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  project: z.string(),
  content: z.string(),
  summary: z.string(),
  tags: z.string(),
  favorite: z.number().int().min(0).max(1),
  archived: z.number().int().min(0).max(1),
  created_at: z.string(),
  updated_at: z.string(),
});

export type MemoryRow = z.infer<typeof memoryRowSchema>;

export interface Memory {
  id: string;
  title: string;
  project: string;
  content: string;
  summary: string;
  tags: string[];
  favorite: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export const createMemorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  project: z.string().max(200).default(''),
  content: z.string().min(1, 'Content is required'),
  summary: z.string().max(2000).default(''),
  tags: z.array(z.string().max(100)).max(50).default([]),
  favorite: z.boolean().default(false),
});

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
