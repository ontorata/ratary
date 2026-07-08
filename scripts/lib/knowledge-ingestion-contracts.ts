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

export const IngestionRunSchema = z.object({
  runId: z.string().uuid(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  totalIngested: z.number().int().nonnegative(),
  totalFailed: z.number().int().nonnegative(),
  digest: z.string().min(8),
  sources: z.array(SourceResultSchema),
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

export const EmbeddingRecordSchema = z.object({
  embeddingId: z.string().min(1),
  chunkId: z.string().min(1),
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

export function assertIngestionRun(candidate: unknown): IngestionRun {
  return IngestionRunSchema.parse(candidate);
}
