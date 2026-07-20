import { z } from 'zod';

export const MEMORY_TYPES = [
  'note',
  'prompt',
  'code',
  'architecture',
  'task',
  'meeting',
  'research',
  'documentation',
  'api',
  'config',
] as const;

export const CATEGORIES = [
  '',
  'Architecture',
  'Development',
  'Research',
  'Meeting',
  'Prompt',
  'Task',
  'API',
] as const;

export const RELATION_TYPES = [
  'related',
  'depends_on',
  'parent',
  'child',
  'duplicate',
  'consolidates',
  'reference',
  // Phase 36 / ADR-069 — decision provenance (additive)
  'motivated_by',
  'caused_by',
  'resulted_in',
  'supersedes',
] as const;

export const SOURCE_TYPES = ['manual', 'inferred', 'import', 'api', 'mcp'] as const;

export type MemoryType = (typeof MEMORY_TYPES)[number];
export type Category = (typeof CATEGORIES)[number];
export type RelationType = (typeof RELATION_TYPES)[number];
export type SourceType = (typeof SOURCE_TYPES)[number];

export const memoryTypeSchema = z.enum(MEMORY_TYPES);
export const categorySchema = z.enum(CATEGORIES);
export const relationTypeSchema = z.enum(RELATION_TYPES);
export const sourceTypeSchema = z.enum(SOURCE_TYPES);

export const knowledgeMetadataSchema = z.object({
  keywords: z.array(z.string().max(100)).max(30).optional(),
  category: categorySchema.optional(),
  memoryType: memoryTypeSchema.optional(),
  importance: z.number().int().min(0).max(100).optional(),
  language: z.string().min(2).max(10).optional(),
  notes: z.string().max(5000).optional(),
});

export const createRelationBodySchema = z.object({
  targetMemoryId: z.string().uuid(),
  relation: relationTypeSchema,
  weight: z.number().min(0).max(10).optional(),
  confidence: z.number().min(0).max(1).optional(),
  sourceType: sourceTypeSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateRelationInput = z.infer<typeof createRelationBodySchema>;

export interface MemoryRelation {
  id: string;
  sourceMemoryId: string;
  targetMemoryId: string;
  relation: RelationType;
  ownerId: string;
  weight: number;
  confidence: number;
  createdBy: string | null;
  sourceType: SourceType;
  metadata: Record<string, unknown>;
  createdAt: string;
}
