import { createHash } from 'node:crypto';
import {
  PIPELINE_STAGES,
  EmbeddingJobExecutionSchema,
  EmbeddingJobSchema,
  EmbeddingRecordSchema,
  type PipelineStage,
  type PipelineStageResult,
  type EmbeddingJob,
  type EmbeddingJobExecution,
  type EmbeddingRecord,
  KnowledgeChunkSchema,
  KnowledgeDocumentSchema,
  type KnowledgeChunk,
  type KnowledgeDocument,
  type PipelineStageStatus,
} from './knowledge-ingestion-contracts.js';
import {
  createEmptySnapshot,
  persistKnowledgeArtifacts,
  type KnowledgeStoreSnapshot,
  type PersistResult,
} from './knowledge-store-boundary.js';

export type RawSourceFile = {
  sourcePath: string;
  filePath: string;
  content: string;
  metadata: {
    sizeBytes: number;
    encoding: 'utf-8';
    modifiedAt?: string;
  };
};

export type PipelineRunOutput = {
  documents: KnowledgeDocument[];
  chunks: KnowledgeChunk[];
  embeddingJobs: EmbeddingJob[];
  embeddingRecords: EmbeddingRecord[];
  embeddingExecutions: EmbeddingJobExecution[];
  knowledgeStoreSnapshot: KnowledgeStoreSnapshot;
  storePersistResult?: PersistResult;
  stageResults: PipelineStageResult[];
};

export type EmbeddingFailure = {
  category:
    | 'temporary_provider_failure'
    | 'timeout'
    | 'invalid_payload'
    | 'corrupted_chunk'
    | 'cancelled_job'
    | 'unknown';
  message: string;
};

function shortHash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

export function normalizeWhitespace(input: string): string {
  const normalizedLineEndings = input.replace(/\r\n?/g, '\n');
  const lines = normalizedLineEndings.split('\n').map((line) => line.trimEnd());

  const output: string[] = [];
  let blankRun = 0;
  for (const line of lines) {
    if (line.length === 0) {
      blankRun += 1;
      if (blankRun > 1) continue;
      output.push('');
      continue;
    }
    blankRun = 0;
    output.push(line);
  }

  return output.join('\n').trim();
}

export function normalizeSourceFile(
  source: RawSourceFile,
  organizationId = 'org-ontorata',
  ingestedAt = new Date().toISOString(),
): KnowledgeDocument {
  const normalizedContent = normalizeWhitespace(source.content);
  const contentDigest = shortHash(normalizedContent);
  const sourceRef = source.filePath.replace(/\\/g, '/');
  const documentId = `doc-${shortHash(`${organizationId}:${sourceRef}`)}`;
  const version = `v-${contentDigest.slice(0, 12)}`;

  return KnowledgeDocumentSchema.parse({
    documentId,
    organizationId,
    sourceType: 'org-memory-source',
    sourceRef,
    title: sourceRef.split('/').pop() ?? sourceRef,
    content: normalizedContent,
    contentDigest,
    version,
    ingestedAt,
    metadata: {
      sourcePath: source.sourcePath,
      ...source.metadata,
    },
  });
}

export type ChunkBuildOptions = {
  maxChunkSize: number;
  overlap: number;
};

export const DEFAULT_CHUNK_OPTIONS: ChunkBuildOptions = {
  maxChunkSize: 1200,
  overlap: 120,
};

export function buildChunks(
  document: KnowledgeDocument,
  options: ChunkBuildOptions = DEFAULT_CHUNK_OPTIONS,
): KnowledgeChunk[] {
  if (options.maxChunkSize <= 0) throw new Error('maxChunkSize must be positive');
  if (options.overlap < 0) throw new Error('overlap must be non-negative');
  if (options.overlap >= options.maxChunkSize) throw new Error('overlap must be smaller than maxChunkSize');

  const content = document.content;
  if (content.length === 0) return [];

  const step = options.maxChunkSize - options.overlap;
  const output: KnowledgeChunk[] = [];

  let start = 0;
  let sequence = 0;
  while (start < content.length) {
    const end = Math.min(start + options.maxChunkSize, content.length);
    const text = content.slice(start, end).trim();
    if (text.length > 0) {
      const textDigest = shortHash(text);
      const chunkId = `chunk-${shortHash(`${document.documentId}:${document.version}:${sequence}:${textDigest}`)}`;
      output.push(
        KnowledgeChunkSchema.parse({
          chunkId,
          documentId: document.documentId,
          organizationId: document.organizationId,
          version: document.version,
          sequence,
          text,
          textDigest,
          section: `char-${start}-${end}`,
        }),
      );
      sequence += 1;
    }

    if (end >= content.length) break;
    start += step;
  }

  return output;
}

export function createEmbeddingJobIdentity(
  chunk: KnowledgeChunk,
  model: string,
  paramsDigest = 'default',
): string {
  return `job-${shortHash(`${chunk.chunkId}:${chunk.version}:${model}:${paramsDigest}`)}`;
}

export function createEmbeddingJob(
  chunk: KnowledgeChunk,
  options?: { model?: string; paramsDigest?: string; requestedAt?: string; attempt?: number },
): EmbeddingJob {
  const model = options?.model ?? 'deterministic-local-v1';
  const paramsDigest = options?.paramsDigest ?? 'default';
  return EmbeddingJobSchema.parse({
    jobId: createEmbeddingJobIdentity(chunk, model, paramsDigest),
    organizationId: chunk.organizationId,
    documentId: chunk.documentId,
    chunkIds: [chunk.chunkId],
    model,
    requestedAt: options?.requestedAt ?? new Date().toISOString(),
    attempt: options?.attempt ?? 0,
    provider: 'deterministic-local',
  });
}

function createEmbeddingRecord(job: EmbeddingJob, chunk: KnowledgeChunk): EmbeddingRecord {
  const vectorDigest = shortHash(`${chunk.textDigest}:${job.model}`);
  return EmbeddingRecordSchema.parse({
    embeddingId: `emb-${shortHash(`${job.jobId}:${chunk.chunkId}:${job.model}`)}`,
    chunkId: chunk.chunkId,
    documentId: chunk.documentId,
    organizationId: chunk.organizationId,
    version: chunk.version,
    model: job.model,
    vectorDigest,
    createdAt: new Date().toISOString(),
    dimensions: 64,
  });
}

export function classifyEmbeddingFailure(error: unknown): EmbeddingFailure {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('timeout')) return { category: 'timeout', message: error.message };
    if (message.includes('temporary') || message.includes('provider unavailable')) {
      return { category: 'temporary_provider_failure', message: error.message };
    }
    if (message.includes('invalid payload') || message.includes('invalid model')) {
      return { category: 'invalid_payload', message: error.message };
    }
    if (message.includes('corrupted')) return { category: 'corrupted_chunk', message: error.message };
    if (message.includes('cancelled')) return { category: 'cancelled_job', message: error.message };
    return { category: 'unknown', message: error.message };
  }
  return { category: 'unknown', message: 'unknown embedding error' };
}

export function shouldRetryEmbeddingFailure(category: EmbeddingFailure['category']): boolean {
  return category === 'temporary_provider_failure' || category === 'timeout';
}

function defaultProviderCall(chunk: KnowledgeChunk, model: string): string {
  return shortHash(`${chunk.textDigest}:${model}`);
}

function runEmbeddingStage(
  chunks: KnowledgeChunk[],
  options?: {
    maxRetries?: number;
    providerCall?: (chunk: KnowledgeChunk, model: string) => string;
    existingRecords?: EmbeddingRecord[];
    cancelledJobIds?: string[];
  },
): { jobs: EmbeddingJob[]; records: EmbeddingRecord[]; executions: EmbeddingJobExecution[]; failed: number } {
  const providerCall = options?.providerCall ?? defaultProviderCall;
  const maxRetries = options?.maxRetries ?? 2;
  const existingByEmbeddingId = new Map(
    (options?.existingRecords ?? []).map((record) => [record.embeddingId, record] as const),
  );
  const cancelledJobIds = new Set(options?.cancelledJobIds ?? []);
  const jobs: EmbeddingJob[] = [];
  const records: EmbeddingRecord[] = [];
  const executions: EmbeddingJobExecution[] = [];
  let failed = 0;

  for (const chunk of chunks) {
    const job = createEmbeddingJob(chunk);
    jobs.push(job);
    const expectedEmbeddingId = `emb-${shortHash(`${job.jobId}:${chunk.chunkId}:${job.model}`)}`;

    if (existingByEmbeddingId.has(expectedEmbeddingId)) {
      records.push(existingByEmbeddingId.get(expectedEmbeddingId)!);
      executions.push(
        EmbeddingJobExecutionSchema.parse({
          jobId: job.jobId,
          chunkId: chunk.chunkId,
          state: 'COMPLETED',
          stateHistory: ['PENDING', 'COMPLETED'],
          attemptCount: 0,
          retryable: false,
          resumable: true,
          completedAt: new Date().toISOString(),
        }),
      );
      continue;
    }

    if (cancelledJobIds.has(job.jobId)) {
      failed += 1;
      executions.push(
        EmbeddingJobExecutionSchema.parse({
          jobId: job.jobId,
          chunkId: chunk.chunkId,
          state: 'CANCELLED',
          stateHistory: ['PENDING', 'RUNNING', 'CANCELLED'],
          attemptCount: 1,
          retryable: false,
          resumable: true,
          errorCategory: 'cancelled_job',
          errorMessage: 'embedding job cancelled before completion',
        }),
      );
      continue;
    }

    if (chunk.text.length === 0) {
      failed += 1;
      executions.push(
        EmbeddingJobExecutionSchema.parse({
          jobId: job.jobId,
          chunkId: chunk.chunkId,
          state: 'FAILED',
          stateHistory: ['PENDING', 'RUNNING', 'FAILED'],
          attemptCount: 1,
          retryable: false,
          resumable: false,
          errorCategory: 'corrupted_chunk',
          errorMessage: 'chunk text is empty',
        }),
      );
      continue;
    }

    let attempt = 0;
    let stateHistory: EmbeddingJobExecution['stateHistory'] = ['PENDING'];
    let lastFailure: EmbeddingFailure | null = null;
    let completed = false;

    while (attempt <= maxRetries) {
      attempt += 1;
      stateHistory = [...stateHistory, ...(attempt === 1 ? ['RUNNING'] : ['RETRYING', 'RUNNING'])];
      try {
        const vectorDigest = providerCall(chunk, job.model);
        records.push(
          EmbeddingRecordSchema.parse({
            ...createEmbeddingRecord(job, chunk),
            vectorDigest,
          }),
        );
        completed = true;
        break;
      } catch (error) {
        lastFailure = classifyEmbeddingFailure(error);
        if (!shouldRetryEmbeddingFailure(lastFailure.category) || attempt > maxRetries) break;
      }
    }

    if (completed) {
      executions.push(
        EmbeddingJobExecutionSchema.parse({
          jobId: job.jobId,
          chunkId: chunk.chunkId,
          state: 'COMPLETED',
          stateHistory: [...stateHistory, 'COMPLETED'],
          attemptCount: attempt,
          retryable: false,
          resumable: true,
          completedAt: new Date().toISOString(),
        }),
      );
      continue;
    }

    failed += 1;
    const failureCategory = lastFailure?.category ?? 'unknown';
    executions.push(
      EmbeddingJobExecutionSchema.parse({
        jobId: job.jobId,
        chunkId: chunk.chunkId,
        state: 'FAILED',
        stateHistory: [...stateHistory, 'FAILED'],
        attemptCount: attempt,
        retryable: shouldRetryEmbeddingFailure(failureCategory),
        resumable: failureCategory === 'cancelled_job' || shouldRetryEmbeddingFailure(failureCategory),
        errorCategory: failureCategory,
        errorMessage: lastFailure?.message ?? 'embedding failed',
      }),
    );
  }

  return { jobs, records, executions, failed };
}

function stageCheckpoint(stage: PipelineStage, processed: number, failed: number, sourcePath?: string): string {
  const suffix = sourcePath ? `:${sourcePath}` : '';
  return `cp-${shortHash(`${stage}:${processed}:${failed}${suffix}`)}`;
}

function buildStageResult(
  stage: PipelineStage,
  status: PipelineStageStatus,
  processed: number,
  failed: number,
  startedAt: Date,
  endedAt: Date,
  flags: { resumable: boolean; replayable: boolean; idempotent: boolean },
  sourcePath?: string,
  error?: string,
): PipelineStageResult {
  return {
    stage,
    status,
    processed,
    failed,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    checkpointId: stageCheckpoint(stage, processed, failed, sourcePath),
    resumable: flags.resumable,
    replayable: flags.replayable,
    idempotent: flags.idempotent,
    sourcePath,
    error,
  };
}

export function orchestratePipeline(
  rawFiles: RawSourceFile[],
  options?: {
    sourceFailed?: number;
    organizationId?: string;
    sourcePath?: string;
    chunkOptions?: ChunkBuildOptions;
    embeddingOptions?: {
      maxRetries?: number;
      providerCall?: (chunk: KnowledgeChunk, model: string) => string;
      existingRecords?: EmbeddingRecord[];
      cancelledJobIds?: string[];
    };
    storeOptions?: {
      previousSnapshot?: KnowledgeStoreSnapshot;
      failBeforeMarkAvailable?: boolean;
    };
  },
): PipelineRunOutput {
  const sourceFailed = options?.sourceFailed ?? 0;
  const organizationId = options?.organizationId ?? 'org-ontorata';
  const sourcePath = options?.sourcePath;
  const chunkOptions = options?.chunkOptions ?? DEFAULT_CHUNK_OPTIONS;

  const stageResults: PipelineStageResult[] = [];
  let documents: KnowledgeDocument[] = [];
  let chunks: KnowledgeChunk[] = [];
  let embeddingJobs: EmbeddingJob[] = [];
  let embeddingRecords: EmbeddingRecord[] = [];
  let embeddingExecutions: EmbeddingJobExecution[] = [];
  let knowledgeStoreSnapshot: KnowledgeStoreSnapshot =
    options?.storeOptions?.previousSnapshot ?? createEmptySnapshot();
  let storePersistResult: PersistResult | undefined;

  const sourceStart = new Date();
  const sourceEnd = new Date();
  stageResults.push(
    buildStageResult(
      'source_intake',
      'completed',
      rawFiles.length,
      sourceFailed,
      sourceStart,
      sourceEnd,
      { resumable: true, replayable: true, idempotent: true },
      sourcePath,
    ),
  );

  const stageStatuses = new Map<PipelineStage, PipelineStageStatus>([['source_intake', 'completed']]);
  const prerequisites: Record<PipelineStage, PipelineStage | null> = {
    source_intake: null,
    normalizer: 'source_intake',
    chunk_builder: 'normalizer',
    embedding_generator: 'chunk_builder',
    knowledge_store: 'embedding_generator',
    index_update: 'knowledge_store',
  };

  for (const stage of PIPELINE_STAGES.slice(1)) {
    const prerequisite = prerequisites[stage];
    if (prerequisite && stageStatuses.get(prerequisite) !== 'completed') {
      const startedAt = new Date();
      const endedAt = new Date();
      stageStatuses.set(stage, 'skipped');
      stageResults.push(
        buildStageResult(
          stage,
          'skipped',
          0,
          0,
          startedAt,
          endedAt,
          { resumable: true, replayable: true, idempotent: true },
          sourcePath,
          `prerequisite ${prerequisite} not completed`,
        ),
      );
      continue;
    }

    const startedAt = new Date();
    if (stage === 'normalizer') {
      const parsedDocuments: KnowledgeDocument[] = [];
      let failed = 0;
      for (const rawFile of rawFiles) {
        try {
          parsedDocuments.push(normalizeSourceFile(rawFile, organizationId));
        } catch {
          failed += 1;
        }
      }
      const endedAt = new Date();
      documents = parsedDocuments;
      stageStatuses.set(stage, 'completed');
      stageResults.push(
        buildStageResult(
          stage,
          'completed',
          parsedDocuments.length,
          failed,
          startedAt,
          endedAt,
          { resumable: true, replayable: true, idempotent: true },
          sourcePath,
        ),
      );
      continue;
    }

    if (stage === 'chunk_builder') {
      const allChunks: KnowledgeChunk[] = [];
      let failed = 0;
      for (const document of documents) {
        const builtChunks = buildChunks(document, chunkOptions);
        if (builtChunks.length === 0) {
          failed += 1;
          continue;
        }
        allChunks.push(...builtChunks);
      }
      const endedAt = new Date();
      chunks = allChunks;
      stageStatuses.set(stage, 'completed');
      stageResults.push(
        buildStageResult(
          stage,
          'completed',
          allChunks.length,
          failed,
          startedAt,
          endedAt,
          { resumable: true, replayable: true, idempotent: true },
          sourcePath,
        ),
      );
      continue;
    }

    if (stage === 'embedding_generator') {
      const embedding = runEmbeddingStage(chunks, options?.embeddingOptions);
      const endedAt = new Date();
      embeddingJobs = embedding.jobs;
      embeddingRecords = embedding.records;
      embeddingExecutions = embedding.executions;
      const status: PipelineStageStatus = embedding.failed > 0 ? 'failed' : 'completed';
      stageStatuses.set(stage, status);
      stageResults.push(
        buildStageResult(
          stage,
          status,
          embedding.records.length,
          embedding.failed,
          startedAt,
          endedAt,
          { resumable: true, replayable: true, idempotent: true },
          sourcePath,
          embedding.failed > 0 ? 'one or more embedding jobs failed' : undefined,
        ),
      );
      continue;
    }

    if (stage === 'knowledge_store') {
      const persist = persistKnowledgeArtifacts(documents, embeddingRecords, {
        previous: knowledgeStoreSnapshot,
        failBeforeMarkAvailable: options?.storeOptions?.failBeforeMarkAvailable,
      });
      const endedAt = new Date();
      knowledgeStoreSnapshot = persist.snapshot;
      storePersistResult = persist;
      const status: PipelineStageStatus = persist.partialFailure ? 'failed' : 'completed';
      stageStatuses.set(stage, status);
      stageResults.push(
        buildStageResult(
          stage,
          status,
          persist.persistedEmbeddingCount,
          persist.partialFailure ? 1 : 0,
          startedAt,
          endedAt,
          { resumable: true, replayable: true, idempotent: true },
          sourcePath,
          persist.partialFailure ? `pending_versions=${persist.pendingVersionIds.length}` : undefined,
        ),
      );
      continue;
    }

    const endedAt = new Date();
    stageStatuses.set(stage, 'skipped');
    stageResults.push(
      buildStageResult(
        stage,
        'skipped',
        0,
        0,
        startedAt,
        endedAt,
        { resumable: true, replayable: true, idempotent: true },
        sourcePath,
        'deferred to Wave 3/4',
      ),
    );
  }

  return {
    documents,
    chunks,
    embeddingJobs,
    embeddingRecords,
    embeddingExecutions,
    knowledgeStoreSnapshot,
    storePersistResult,
    stageResults,
  };
}
