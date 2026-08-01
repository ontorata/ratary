import { z } from 'zod';

export const DecisionModelComputedPluginSummarySchema = z.object({
  kind: z.literal('worker'),
  artifactDigestPrefix: z.string().min(1),
});

export type DecisionModelComputedPluginSummary = z.infer<
  typeof DecisionModelComputedPluginSummarySchema
>;

export const DecisionModelCatalogEntrySchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().optional(),
  stability: z.enum(['experimental', 'stable', 'deprecated']),
  executionProfileName: z.string().min(1),
  capabilities: z.array(z.string().min(1)),
  computedPlugin: DecisionModelComputedPluginSummarySchema.optional(),
});

export type DecisionModelCatalogEntry = z.infer<typeof DecisionModelCatalogEntrySchema>;

export const DecisionModelCatalogResponseSchema = z.object({
  models: z.array(DecisionModelCatalogEntrySchema),
});

export type DecisionModelCatalogResponse = z.infer<typeof DecisionModelCatalogResponseSchema>;

export const SandboxOutcomeSchema = z.enum(['ok', 'timeout', 'error', 'denied', 'disabled']);

export type SandboxOutcome = z.infer<typeof SandboxOutcomeSchema>;
