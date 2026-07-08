import { describe, expect, it } from 'vitest';
import {
  buildChunks,
  createEmbeddingJobIdentity,
  normalizeSourceFile,
  normalizeWhitespace,
  orchestratePipeline,
  type RawSourceFile,
} from './knowledge-ingestion-pipeline.js';

function sampleRaw(content: string): RawSourceFile {
  return {
    sourcePath: '.ai/core/',
    filePath: '.ai/core/governance/sample.md',
    content,
    metadata: {
      sizeBytes: Buffer.byteLength(content, 'utf-8'),
      encoding: 'utf-8',
      modifiedAt: '2026-07-08T06:00:00.000Z',
    },
  };
}

describe('knowledge ingestion pipeline core', () => {
  it('normalizer is deterministic and preserves metadata', () => {
    const raw = sampleRaw('Line 1\r\n\r\n\r\nLine 2   \r\n');
    const fixedTime = '2026-07-08T06:00:00.000Z';
    const a = normalizeSourceFile(raw, 'org-ontorata', fixedTime);
    const b = normalizeSourceFile(raw, 'org-ontorata', fixedTime);

    expect(a).toEqual(b);
    expect(a.content).toBe('Line 1\n\nLine 2');
    expect(a.metadata?.encoding).toBe('utf-8');
    expect(a.metadata?.sourcePath).toBe('.ai/core/');
  });

  it('normalizer keeps encoding output consistent', () => {
    const normalized = normalizeWhitespace('A\r\nB\r\n');
    expect(normalized.includes('\r')).toBe(false);
    expect(normalized).toBe('A\nB');
  });

  it('chunk builder keeps stable order, deterministic IDs, and overlap', () => {
    const document = normalizeSourceFile(
      sampleRaw('a'.repeat(30) + 'b'.repeat(30) + 'c'.repeat(30)),
      'org-ontorata',
      '2026-07-08T06:00:00.000Z',
    );
    const options = { maxChunkSize: 40, overlap: 10 };
    const first = buildChunks(document, options);
    const second = buildChunks(document, options);

    expect(first.map((chunk) => chunk.chunkId)).toEqual(second.map((chunk) => chunk.chunkId));
    expect(first.every((chunk) => chunk.text.length > 0)).toBe(true);
    expect(first.every((chunk) => chunk.text.length <= 40)).toBe(true);
    for (let index = 1; index < first.length; index += 1) {
      const prev = first[index - 1];
      const curr = first[index];
      const overlapTail = prev.text.slice(-10);
      expect(curr.text.startsWith(overlapTail)).toBe(true);
      expect(curr.sequence).toBe(index);
    }
  });

  it('orchestrator enforces prerequisites and stage resumability flags', () => {
    const output = orchestratePipeline([sampleRaw('hello world')], {
      sourcePath: '.ai/core/',
      sourceFailed: 0,
    });
    const stageByName = new Map(output.stageResults.map((stage) => [stage.stage, stage]));

    expect(stageByName.get('source_intake')?.status).toBe('completed');
    expect(stageByName.get('normalizer')?.status).toBe('completed');
    expect(stageByName.get('chunk_builder')?.status).toBe('completed');
    expect(stageByName.get('embedding_generator')?.status).toBe('completed');
    expect(stageByName.get('knowledge_store')?.status).toBe('skipped');
    expect(stageByName.get('index_update')?.status).toBe('skipped');
    expect(output.stageResults.every((stage) => stage.resumable)).toBe(true);
    expect(output.stageResults.every((stage) => stage.idempotent)).toBe(true);
  });

  it('orchestrator remains idempotent for repeated identical input', () => {
    const raw = [sampleRaw('repeatable content')];
    const first = orchestratePipeline(raw, { sourcePath: '.ai/core/' });
    const second = orchestratePipeline(raw, { sourcePath: '.ai/core/' });

    expect(first.documents.map((doc) => doc.documentId)).toEqual(
      second.documents.map((doc) => doc.documentId),
    );
    expect(first.chunks.map((chunk) => chunk.chunkId)).toEqual(
      second.chunks.map((chunk) => chunk.chunkId),
    );
  });

  it('uses deterministic embedding job identity for same chunk and model params', () => {
    const document = normalizeSourceFile(
      sampleRaw('embedding identity test'),
      'org-ontorata',
      '2026-07-08T06:00:00.000Z',
    );
    const chunk = buildChunks(document, { maxChunkSize: 50, overlap: 5 })[0];
    const a = createEmbeddingJobIdentity(chunk, 'model-v1', 'params-a');
    const b = createEmbeddingJobIdentity(chunk, 'model-v1', 'params-a');
    const c = createEmbeddingJobIdentity(chunk, 'model-v2', 'params-a');

    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('retries temporary provider failures and completes embedding job', () => {
    let callCount = 0;
    const output = orchestratePipeline([sampleRaw('retry scenario text')], {
      sourcePath: '.ai/core/',
      embeddingOptions: {
        maxRetries: 2,
        providerCall: () => {
          callCount += 1;
          if (callCount === 1) throw new Error('temporary provider unavailable');
          return 'deterministic-vector';
        },
      },
    });

    const execution = output.embeddingExecutions[0];
    expect(execution?.state).toBe('COMPLETED');
    expect(execution?.attemptCount).toBe(2);
  });

  it('fails fast for invalid payload without retry', () => {
    const output = orchestratePipeline([sampleRaw('invalid payload text')], {
      sourcePath: '.ai/core/',
      embeddingOptions: {
        maxRetries: 2,
        providerCall: () => {
          throw new Error('invalid payload for embedding');
        },
      },
    });

    const execution = output.embeddingExecutions[0];
    expect(execution?.state).toBe('FAILED');
    expect(execution?.attemptCount).toBe(1);
    expect(execution?.errorCategory).toBe('invalid_payload');
  });

  it('reuses existing embedding records to avoid duplicate persistence on rerun', () => {
    const firstRun = orchestratePipeline([sampleRaw('idempotent resume content')], {
      sourcePath: '.ai/core/',
    });
    const firstRecord = firstRun.embeddingRecords[0];
    expect(firstRecord).toBeDefined();

    const secondRun = orchestratePipeline([sampleRaw('idempotent resume content')], {
      sourcePath: '.ai/core/',
      embeddingOptions: {
        existingRecords: firstRun.embeddingRecords,
        providerCall: () => {
          throw new Error('provider call should be skipped when existing record exists');
        },
      },
    });

    expect(secondRun.embeddingRecords[0]?.embeddingId).toBe(firstRecord?.embeddingId);
    expect(secondRun.embeddingExecutions[0]?.attemptCount).toBe(0);
    expect(secondRun.embeddingExecutions[0]?.state).toBe('COMPLETED');
  });

  it('marks cancelled jobs as resumable cancellations', () => {
    const document = normalizeSourceFile(
      sampleRaw('cancelled job content'),
      'org-ontorata',
      '2026-07-08T06:00:00.000Z',
    );
    const chunk = buildChunks(document, { maxChunkSize: 64, overlap: 8 })[0];
    const cancelledJobId = createEmbeddingJobIdentity(chunk, 'deterministic-local-v1', 'default');

    const output = orchestratePipeline([sampleRaw('cancelled job content')], {
      sourcePath: '.ai/core/',
      embeddingOptions: {
        cancelledJobIds: [cancelledJobId],
      },
    });

    const execution = output.embeddingExecutions[0];
    expect(execution?.state).toBe('CANCELLED');
    expect(execution?.resumable).toBe(true);
    expect(execution?.errorCategory).toBe('cancelled_job');
  });
});
