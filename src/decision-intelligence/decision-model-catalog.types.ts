import { z } from 'zod';

export const DecisionModelCatalogEntrySchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().optional(),
  stability: z.enum(['experimental', 'stable', 'deprecated']),
  executionProfileName: z.string().min(1),
  capabilities: z.array(z.string().min(1)),
});

export type DecisionModelCatalogEntry = z.infer<typeof DecisionModelCatalogEntrySchema>;

export const DecisionModelCatalogResponseSchema = z.object({
  models: z.array(DecisionModelCatalogEntrySchema),
});

export type DecisionModelCatalogResponse = z.infer<typeof DecisionModelCatalogResponseSchema>;
