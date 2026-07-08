import { z } from 'zod';

export const RECALL_DECISION_STAGES = [
  'candidate_fetch',
  'policy_filter',
  'rank',
  'assemble',
] as const;

export type RecallDecisionStage = (typeof RECALL_DECISION_STAGES)[number];

export const RecallDecisionStageSchema = z.enum(RECALL_DECISION_STAGES);

export const RecallStatusSchema = z.enum(['completed', 'partial', 'failed']);
export type RecallStatus = z.infer<typeof RecallStatusSchema>;

export const TraceContextSchema = z
  .object({
    sessionId: z.string().min(1).optional(),
    correlationId: z.string().min(1).optional(),
    handoffId: z.string().min(1).optional(),
  })
  .refine((value) => Boolean(value.sessionId ?? value.correlationId), {
    message: 'traceContext requires sessionId or correlationId',
  });

export type TraceContext = z.infer<typeof TraceContextSchema>;

export const RecallRequestSchema = z.object({
  requestId: z.string().min(1),
  organizationId: z.string().min(1),
  query: z.string().min(1),
  traceContext: TraceContextSchema,
  workspaceId: z.string().min(1).optional(),
  projectId: z.string().min(1).optional(),
  filters: z.record(z.unknown()).optional(),
  limit: z.number().int().positive().max(50).optional(),
  tags: z.array(z.string()).optional(),
  levels: z.array(z.string()).optional(),
  freshnessPolicy: z.string().min(1).optional(),
  contextBudget: z.number().int().positive().optional(),
});

export type RecallRequest = z.infer<typeof RecallRequestSchema>;

export const RecallSignalsSchema = z.record(z.number());
export type RecallSignals = z.infer<typeof RecallSignalsSchema>;

export const RecallCandidateMetadataSchema = z.object({
  source: z.string().min(1),
  sourceId: z.string().min(1),
  contentType: z.string().min(1),
  organizationId: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  permissions: z.array(z.string()).default([]),
  embeddingVersion: z.string().min(1).optional(),
  tokenCount: z.number().int().nonnegative().optional(),
  provenance: z.string().min(1),
});

export type RecallCandidateMetadata = z.infer<typeof RecallCandidateMetadataSchema>;

export const RecallCandidateSchema = z.object({
  candidateId: z.string().min(1),
  organizationId: z.string().min(1),
  sourceType: z.string().min(1),
  sourceReference: z.string().min(1),
  signals: RecallSignalsSchema,
  documentId: z.string().min(1).optional(),
  versionId: z.string().min(1).optional(),
  chunkId: z.string().min(1).optional(),
  memoryId: z.string().min(1).optional(),
  metadata: RecallCandidateMetadataSchema,
  confidence: z.number().min(0).max(1).optional(),
});

export type RecallCandidate = z.infer<typeof RecallCandidateSchema>;

export const CandidateSetSchema = z.object({
  requestId: z.string().min(1),
  organizationId: z.string().min(1),
  candidates: z.array(RecallCandidateSchema),
  generatedAt: z.string().datetime(),
  providerName: z.string().min(1).optional(),
  providerLatencyMs: z.number().int().nonnegative().optional(),
  truncated: z.boolean().optional(),
});

export type CandidateSet = z.infer<typeof CandidateSetSchema>;

export const RecallProviderTraceSchema = z.object({
  provider: z.string().min(1),
  queryTimeMs: z.number().int().nonnegative(),
  returned: z.number().int().nonnegative(),
  filtered: z.number().int().nonnegative(),
  candidateSetHash: z.string().min(1),
});

export type RecallProviderTrace = z.infer<typeof RecallProviderTraceSchema>;

export const RecallTraceSchema = z.object({
  traceId: z.string().min(1),
  requestId: z.string().min(1),
  organizationId: z.string().min(1),
  candidateCount: z.number().int().nonnegative(),
  decisionPath: z.array(RecallDecisionStageSchema).min(1),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  policyVersion: z.string().min(1).optional(),
  rankingVersion: z.string().min(1).optional(),
  warnings: z.array(z.string()).optional(),
  providerTrace: RecallProviderTraceSchema.optional(),
});

export type RecallTrace = z.infer<typeof RecallTraceSchema>;

export const RecallSignalReasonSchema = z.object({
  reason: z.string().min(1),
  weight: z.number(),
  contribution: z.number(),
});
export type RecallSignalReason = z.infer<typeof RecallSignalReasonSchema>;

export const RecallDecisionCandidateOutcomeSchema = z.object({
  candidateId: z.string().min(1),
  outcome: z.enum(['selected', 'rejected_filter', 'rejected_rank', 'rejected_limit']),
  reasons: z.array(RecallSignalReasonSchema),
  score: z.number(),
});
export type RecallDecisionCandidateOutcome = z.infer<typeof RecallDecisionCandidateOutcomeSchema>;

export const RecallDecisionSchema = z.object({
  requestId: z.string().min(1),
  policyVersion: z.string().min(1),
  selectedCandidates: z.array(z.string().min(1)),
  rejectedCandidates: z.array(z.string().min(1)),
  decisionReason: z.string().min(1),
  confidenceSummary: z.string().min(1),
  traceId: z.string().min(1).optional(),
  rankingVersion: z.string().min(1).optional(),
  candidateOutcomes: z.array(RecallDecisionCandidateOutcomeSchema).optional(),
  policyExecution: z
    .object({
      policyName: z.string().min(1),
      executionTimeMs: z.number().int().nonnegative(),
      candidatesScored: z.number().int().nonnegative(),
      candidatesSelected: z.number().int().nonnegative(),
      primaryReason: z.string().min(1),
    })
    .optional(),
});

export type RecallDecision = z.infer<typeof RecallDecisionSchema>;

export const ContextAttributionSchema = z.object({
  candidateId: z.string().min(1),
  sourceReference: z.string().min(1),
  sourceType: z.string().min(1).optional(),
});

export type ContextAttribution = z.infer<typeof ContextAttributionSchema>;

export const ContextPackageItemSchema = z.object({
  itemId: z.string().min(1),
  candidateId: z.string().min(1),
  text: z.string().min(1),
  sourceReference: z.string().min(1),
  tokenCount: z.number().int().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ContextPackageItem = z.infer<typeof ContextPackageItemSchema>;

export const ContextTokenUsageSchema = z.object({
  budget: z.number().int().positive(),
  used: z.number().int().nonnegative(),
  remaining: z.number().int().nonnegative(),
});

export type ContextTokenUsage = z.infer<typeof ContextTokenUsageSchema>;

export const ContextTruncationSchema = z.object({
  truncated: z.boolean(),
  omittedCandidateIds: z.array(z.string().min(1)),
  omittedCount: z.number().int().nonnegative(),
});

export type ContextTruncation = z.infer<typeof ContextTruncationSchema>;

export const ContextProvenanceSchema = z.object({
  source: z.literal('recall-intelligence'),
  policyVersion: z.string().min(1),
  selectedCandidateCount: z.number().int().nonnegative(),
  assembledCandidateCount: z.number().int().nonnegative(),
  rankingOrderPreserved: z.literal(true),
});

export type ContextProvenance = z.infer<typeof ContextProvenanceSchema>;

export const ContextPackageSchema = z.object({
  packageId: z.string().min(1),
  generatedAt: z.string().datetime(),
  requestId: z.string().min(1),
  traceId: z.string().min(1),
  organizationId: z.string().min(1),
  sourceRecallDecisionId: z.string().min(1),
  policyVersion: z.string().min(1),
  items: z.array(ContextPackageItemSchema),
  sourceAttribution: z.array(ContextAttributionSchema),
  tokenUsage: ContextTokenUsageSchema,
  truncation: ContextTruncationSchema,
  provenance: ContextProvenanceSchema,
  tokenBudget: z.number().int().positive().optional(),
  truncated: z.boolean().optional(),
  freshnessMetadata: z.record(z.unknown()).optional(),
});

export type ContextPackage = z.infer<typeof ContextPackageSchema>;

export const RecallResultSchema = z.object({
  requestId: z.string().min(1),
  traceId: z.string().min(1),
  organizationId: z.string().min(1),
  candidates: z.array(RecallCandidateSchema),
  rankedCandidates: z.array(RecallCandidateSchema),
  status: RecallStatusSchema,
  missingSources: z.array(z.string()).optional(),
  degradedMode: z.boolean().optional(),
  latencyMs: z.number().int().nonnegative().optional(),
  decision: RecallDecisionSchema.optional(),
  contextPackage: ContextPackageSchema.optional(),
});

export type RecallResult = z.infer<typeof RecallResultSchema>;

export function assertRecallRequest(value: unknown): RecallRequest {
  return RecallRequestSchema.parse(value);
}

export function assertCandidateSet(value: unknown): CandidateSet {
  return CandidateSetSchema.parse(value);
}

export function assertRecallTrace(value: unknown): RecallTrace {
  return RecallTraceSchema.parse(value);
}

export function assertRecallResult(value: unknown): RecallResult {
  return RecallResultSchema.parse(value);
}

export function assertRecallDecision(value: unknown): RecallDecision {
  return RecallDecisionSchema.parse(value);
}

export function assertContextPackage(value: unknown): ContextPackage {
  return ContextPackageSchema.parse(value);
}

export function candidateSetHash(candidateSet: CandidateSet): string {
  const payload = candidateSet.candidates
    .map((candidate) => candidate.candidateId)
    .sort()
    .join('|');
  return `csh-${payload.length}-${payload}`;
}
