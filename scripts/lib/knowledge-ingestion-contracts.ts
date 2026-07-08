import { z } from 'zod';

export const PIPELINE_STAGES = [
  'source_intake',
  'normalizer',
  'chunk_builder',
  'embedding_generator',
  'knowledge_store',
  'index_update',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const PipelineStageSchema = z.enum(PIPELINE_STAGES);
export const PipelineStageStatusSchema = z.enum(['completed', 'failed', 'skipped']);
export type PipelineStageStatus = z.infer<typeof PipelineStageStatusSchema>;

export const SourceModeSchema = z.enum(['directory', 'file', 'adr-glob']);

export const SourceDefinitionSchema = z.object({
  sourcePath: z.string().min(1),
  mode: SourceModeSchema,
});

export type SourceDefinition = z.infer<typeof SourceDefinitionSchema>;

export const SourceResultSchema = z.object({
  sourcePath: z.string().min(1),
  ingested: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
});

export type SourceResult = z.infer<typeof SourceResultSchema>;

export const PipelineStageResultSchema = z.object({
  stage: PipelineStageSchema,
  status: PipelineStageStatusSchema,
  processed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  checkpointId: z.string().min(1),
  resumable: z.boolean(),
  replayable: z.boolean(),
  idempotent: z.boolean(),
  sourcePath: z.string().min(1).optional(),
  error: z.string().optional(),
});

export type PipelineStageResult = z.infer<typeof PipelineStageResultSchema>;

export const IngestionRunSchema = z.object({
  runId: z.string().uuid(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  totalIngested: z.number().int().nonnegative(),
  totalFailed: z.number().int().nonnegative(),
  digest: z.string().min(8),
  sources: z.array(SourceResultSchema),
  stageResults: z.array(PipelineStageResultSchema).optional(),
});

export type IngestionRun = z.infer<typeof IngestionRunSchema>;

export const KnowledgeDocumentSchema = z.object({
  documentId: z.string().min(1),
  organizationId: z.string().min(1),
  sourceType: z.string().min(1),
  sourceRef: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  contentDigest: z.string().min(8),
  version: z.string().min(1),
  ingestedAt: z.string().datetime(),
  workspaceId: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  language: z.string().optional(),
  lastModifiedAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type KnowledgeDocument = z.infer<typeof KnowledgeDocumentSchema>;

export const KnowledgeChunkSchema = z.object({
  chunkId: z.string().min(1),
  documentId: z.string().min(1),
  organizationId: z.string().min(1),
  version: z.string().min(1),
  sequence: z.number().int().nonnegative(),
  text: z.string().min(1),
  textDigest: z.string().min(8),
  tokenCount: z.number().int().nonnegative().optional(),
  section: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type KnowledgeChunk = z.infer<typeof KnowledgeChunkSchema>;

export const EmbeddingJobSchema = z.object({
  jobId: z.string().min(1),
  organizationId: z.string().min(1),
  documentId: z.string().min(1),
  chunkIds: z.array(z.string().min(1)).min(1),
  model: z.string().min(1),
  requestedAt: z.string().datetime(),
  attempt: z.number().int().nonnegative(),
  provider: z.string().optional(),
  workspaceId: z.string().optional(),
  traceId: z.string().optional(),
});

export type EmbeddingJob = z.infer<typeof EmbeddingJobSchema>;

export const EmbeddingJobStateSchema = z.enum([
  'PENDING',
  'RUNNING',
  'RETRYING',
  'FAILED',
  'COMPLETED',
  'CANCELLED',
]);

export type EmbeddingJobState = z.infer<typeof EmbeddingJobStateSchema>;

export const EmbeddingErrorCategorySchema = z.enum([
  'temporary_provider_failure',
  'timeout',
  'invalid_payload',
  'corrupted_chunk',
  'cancelled_job',
  'unknown',
]);

export type EmbeddingErrorCategory = z.infer<typeof EmbeddingErrorCategorySchema>;

export const EmbeddingJobExecutionSchema = z.object({
  jobId: z.string().min(1),
  chunkId: z.string().min(1),
  state: EmbeddingJobStateSchema,
  stateHistory: z.array(EmbeddingJobStateSchema).min(1),
  attemptCount: z.number().int().nonnegative(),
  retryable: z.boolean(),
  resumable: z.boolean(),
  errorCategory: EmbeddingErrorCategorySchema.optional(),
  errorMessage: z.string().optional(),
  completedAt: z.string().datetime().optional(),
});

export type EmbeddingJobExecution = z.infer<typeof EmbeddingJobExecutionSchema>;

export const EmbeddingRecordSchema = z.object({
  embeddingId: z.string().min(1),
  chunkId: z.string().min(1),
  documentId: z.string().min(1),
  organizationId: z.string().min(1),
  version: z.string().min(1),
  model: z.string().min(1),
  vectorDigest: z.string().min(8),
  createdAt: z.string().datetime(),
  dimensions: z.number().int().positive().optional(),
  providerLatencyMs: z.number().int().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type EmbeddingRecord = z.infer<typeof EmbeddingRecordSchema>;

export const KnowledgeVersionSchema = z.object({
  versionId: z.string().min(1),
  documentId: z.string().min(1),
  organizationId: z.string().min(1),
  contentDigest: z.string().min(8),
  status: z.enum(['pending', 'active', 'superseded', 'failed']),
  createdAt: z.string().datetime(),
  previousVersionId: z.string().optional(),
  changeReason: z.string().optional(),
  supersededAt: z.string().datetime().optional(),
});

export type KnowledgeVersion = z.infer<typeof KnowledgeVersionSchema>;

export const KnowledgeStoreRecordSchema = z.object({
  versionId: z.string().min(1),
  documentId: z.string().min(1),
  organizationId: z.string().min(1),
  version: z.string().min(1),
  status: z.enum(['pending', 'available', 'failed']),
  embeddingCount: z.number().int().nonnegative(),
  recoveryToken: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type KnowledgeStoreRecord = z.infer<typeof KnowledgeStoreRecordSchema>;

export const IndexUpdateEventSchema = z.object({
  eventId: z.string().min(1),
  versionId: z.string().min(1),
  documentId: z.string().min(1),
  organizationId: z.string().min(1),
  status: z.enum(['pending', 'completed', 'failed']),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  error: z.string().optional(),
});

export type IndexUpdateEvent = z.infer<typeof IndexUpdateEventSchema>;

export function assertIngestionRun(candidate: unknown): IngestionRun {
  return IngestionRunSchema.parse(candidate);
}
