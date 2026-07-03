import { z } from 'zod';
import { RELATION_TYPES } from './knowledge.js';

export const traverseGraphBodySchema = z.object({
  memoryId: z.string().uuid(),
  depth: z.number().int().min(1).max(3).optional(),
  types: z.array(z.enum(RELATION_TYPES)).optional(),
});

export type TraverseGraphBody = z.infer<typeof traverseGraphBodySchema>;
