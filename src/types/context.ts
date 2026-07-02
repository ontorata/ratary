import { z } from 'zod';
import { MEMORY_LEVELS } from './memory-level.js';

export const contextBuildOptionsSchema = z.object({
  maxChars: z.number().int().min(500).max(24_000).optional(),
  includeSummaryOnly: z.boolean().optional(),
  format: z.enum(['markdown', 'xml']).optional(),
});

export const buildContextBodySchema = z.object({
  projectId: z.string().max(80).optional(),
  query: z.string().max(500).optional(),
  tags: z.array(z.string().max(100)).max(20).optional(),
  levels: z.array(z.enum(MEMORY_LEVELS)).max(4).optional(),
  limit: z.number().int().min(1).max(20).optional(),
  task: z.string().min(1).max(10_000),
  systemRole: z.string().max(5_000).optional(),
  context: contextBuildOptionsSchema.optional(),
});

export type BuildContextBody = z.infer<typeof buildContextBodySchema>;

export const getContextBodySchema = buildContextBodySchema
  .omit({ task: true, systemRole: true })
  .extend({
    query: z.string().min(1).max(500).optional(),
  });

export type GetContextBody = z.infer<typeof getContextBodySchema>;
