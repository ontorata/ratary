import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { SandboxOutcomeSchema } from './decision-model-catalog.types.js';

export const DecisionProvenanceRecordSchema = z.object({
  recordId: z.string().min(1),
  ownerId: z.string().min(1),
  briefId: z.string().min(1),
  packageId: z.string().min(1).optional(),
  verdict: z.enum(['accepted', 'rejected']),
  rationale: z.string().optional(),
  sourceMemoryIds: z.array(z.string().min(1)),
  recordedAt: z.string().datetime(),
  decisionModelId: z.string().min(1).optional(),
  decisionModelVersion: z.string().min(1).optional(),
  decisionModelPluginDigest: z.string().min(1).optional(),
  sandboxOutcome: SandboxOutcomeSchema.optional(),
});

export type DecisionProvenanceRecord = z.infer<typeof DecisionProvenanceRecordSchema>;

export const CreateDecisionProvenanceBodySchema = z
  .object({
    briefId: z.string().min(1),
    packageId: z.string().min(1).optional(),
    verdict: z.enum(['accepted', 'rejected']),
    rationale: z.string().max(4000).optional(),
    sourceMemoryIds: z.array(z.string().min(1)).default([]),
    decisionModelId: z.string().min(1).optional(),
    decisionModelVersion: z.string().min(1).optional(),
    decisionModelPluginDigest: z.string().min(1).optional(),
    sandboxOutcome: SandboxOutcomeSchema.optional(),
  })
  .strict();

export type CreateDecisionProvenanceBody = z.infer<typeof CreateDecisionProvenanceBodySchema>;

export function parseCreateDecisionProvenanceBody(body: unknown): CreateDecisionProvenanceBody {
  return CreateDecisionProvenanceBodySchema.parse(body);
}

export function buildDecisionProvenanceRecord(
  ownerId: string,
  body: CreateDecisionProvenanceBody,
): DecisionProvenanceRecord {
  return DecisionProvenanceRecordSchema.parse({
    recordId: randomUUID(),
    ownerId,
    briefId: body.briefId,
    packageId: body.packageId,
    verdict: body.verdict,
    rationale: body.rationale,
    sourceMemoryIds: body.sourceMemoryIds,
    recordedAt: new Date().toISOString(),
    decisionModelId: body.decisionModelId,
    decisionModelVersion: body.decisionModelVersion,
    decisionModelPluginDigest: body.decisionModelPluginDigest,
    sandboxOutcome: body.sandboxOutcome,
  });
}
