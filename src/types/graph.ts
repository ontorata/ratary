import { z } from 'zod';
import { RELATION_TYPES } from './knowledge.js';

export const traverseGraphBodySchema = z
  .object({
    memoryId: z.string().uuid().optional(),
    depth: z.number().int().min(1).max(3).optional(),
    types: z.array(z.enum(RELATION_TYPES)).optional(),
    direction: z.enum(['outgoing', 'incoming', 'both']).optional(),
    seed: z
      .object({
        memoryId: z.string().uuid().optional(),
        slug: z.string().optional(),
        sourcePath: z.string().optional(),
      })
      .optional(),
  })
  .refine(
    (data) =>
      Boolean(data.memoryId ?? data.seed?.memoryId ?? data.seed?.slug ?? data.seed?.sourcePath),
    { message: 'memoryId or seed is required' },
  );

export type TraverseGraphBody = z.infer<typeof traverseGraphBodySchema>;
