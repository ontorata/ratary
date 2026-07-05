import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  IMemoryReader,
  IMemoryWriter,
} from '../../src/repositories/memory.repository.interface.js';
import type { Memory } from '../../src/types/memory.js';
import { EmbeddingJobRunner } from '../../src/embedding/embedding-job.runner.js';
import type { IEmbeddingProvider } from '../../src/embedding/embedding.provider.interface.js';
import type {
  IEmbeddingStore,
  StoredEmbedding,
} from '../../src/embedding/embedding.store.interface.js';
import { NOOP_EMBEDDING_MODEL_ID } from '../../src/embedding/noop-embedding.provider.js';
import { computeEmbedContentHash } from '../../src/embedding/embed-text.js';

function makeMemory(overrides: Partial<Memory> & Pick<Memory, 'id'>): Memory {
  return {
    title: 'Title',
    project: 'proj',
    projectId: 'proj',
    content: 'Content body',
    summary: 'Summary',
    tags: [],
    keywords: [],
    category: '',
    memoryType: 'note',
    importance: 50,
    language: 'id',
    notes: '',
    codename: 'NOTE-0001',
    slug: 'title',
    favorite: false,
    archived: false,
    ownerId: 'owner-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    level: 'note',
    lastAccessed: null,
    accessCount: 0,
    embeddingId: null,
    objectKey: null,
    semanticHash: null,
    ...overrides,
  };
}

describe('EmbeddingJobRunner', () => {
  let reader: IMemoryReader;
  let writer: IMemoryWriter;
  let provider: IEmbeddingProvider;
  let store: IEmbeddingStore;
  let pending: Memory[];
  let backfills: Array<{ id: string; ownerId: string; embeddingId: string }>;
  let stored: Map<string, StoredEmbedding>;

  beforeEach(() => {
    pending = [makeMemory({ id: 'mem-1', title: 'A' }), makeMemory({ id: 'mem-2', title: 'B' })];
    backfills = [];
    stored = new Map();

    reader = {
      findWithoutEmbedding: vi.fn(async (_ownerId: string, limit: number) => {
        return pending.splice(0, limit);
      }),
      findAllByOwner: vi.fn(async () => []),
    } as unknown as IMemoryReader;

    writer = {
      applyEmbeddingBackfill: vi.fn(async (id, ownerId, data) => {
        backfills.push({ id, ownerId, embeddingId: data.embeddingId });
      }),
    } as unknown as IMemoryWriter;

    provider = {
      modelId: NOOP_EMBEDDING_MODEL_ID,
      dimensions: 3,
      embed: vi.fn(async (inputs) =>
        inputs.map((input) => ({
          memoryId: input.memoryId,
          vector: [1, 0, 0],
          modelId: NOOP_EMBEDDING_MODEL_ID,
          dimensions: 3,
        })),
      ),
    };

    store = {
      upsert: vi.fn(async (input) => {
        const id = `emb-${input.memoryId}`;
        stored.set(id, {
          id,
          memoryId: input.memoryId,
          ownerId: input.ownerId,
          modelId: input.modelId,
          dimensions: input.dimensions,
          vector: input.vector,
          contentHash: input.contentHash,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        });
        return id;
      }),
      findByMemoryId: vi.fn(async (memoryId, ownerId, modelId) => {
        for (const row of stored.values()) {
          if (row.memoryId === memoryId && row.ownerId === ownerId && row.modelId === modelId) {
            return row;
          }
        }
        return null;
      }),
      deleteByMemoryId: vi.fn(async () => undefined),
      searchSimilar: vi.fn(async () => []),
    };
  });

  it('should dry-run without writing embeddings', async () => {
    const runner = new EmbeddingJobRunner(reader, writer, provider, store);

    const report = await runner.run({ ownerId: 'owner-1', dryRun: true, batchSize: 10 });

    expect(report).toEqual({
      scanned: 2,
      embedded: 2,
      skipped: 0,
      failed: 0,
      dryRun: true,
    });
    expect(provider.embed).not.toHaveBeenCalled();
    expect(writer.applyEmbeddingBackfill).not.toHaveBeenCalled();
    expect(store.upsert).not.toHaveBeenCalled();
  });

  it('should embed memories and apply embedding backfill', async () => {
    const runner = new EmbeddingJobRunner(reader, writer, provider, store);

    const report = await runner.run({ ownerId: 'owner-1', dryRun: false, batchSize: 10 });

    expect(report.embedded).toBe(2);
    expect(report.failed).toBe(0);
    expect(provider.embed).toHaveBeenCalledTimes(2);
    expect(store.upsert).toHaveBeenCalledTimes(2);
    expect(backfills).toHaveLength(2);
    expect(backfills[0]?.embeddingId).toBe('emb-mem-1');
  });

  it('should skip unchanged content_hash and link existing embedding id', async () => {
    const memory = makeMemory({ id: 'mem-skip', title: 'Skip me' });
    pending = [memory];

    const contentHash = computeEmbedContentHash(memory.title, memory.summary, memory.content);
    stored.set('emb-existing', {
      id: 'emb-existing',
      memoryId: memory.id,
      ownerId: memory.ownerId,
      modelId: NOOP_EMBEDDING_MODEL_ID,
      dimensions: 3,
      vector: [1, 0, 0],
      contentHash,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const runner = new EmbeddingJobRunner(reader, writer, provider, store);
    const report = await runner.run({ ownerId: 'owner-1', dryRun: false, batchSize: 10 });

    expect(report.skipped).toBe(1);
    expect(report.embedded).toBe(0);
    expect(provider.embed).not.toHaveBeenCalled();
    expect(backfills).toEqual([
      { id: 'mem-skip', ownerId: 'owner-1', embeddingId: 'emb-existing' },
    ]);
  });

  it('should count failures without stopping the batch', async () => {
    pending = [makeMemory({ id: 'mem-fail' })];
    vi.mocked(provider.embed).mockRejectedValueOnce(new Error('provider down'));

    const runner = new EmbeddingJobRunner(reader, writer, provider, store);
    const report = await runner.run({ ownerId: 'owner-1', dryRun: false, batchSize: 10 });

    expect(report.failed).toBe(1);
    expect(report.embedded).toBe(0);
    expect(backfills).toHaveLength(0);
  });

  it('should cap scanned memories via maxMemories', async () => {
    pending = Array.from({ length: 50 }, (_, i) =>
      makeMemory({ id: `mem-${i}`, title: `Title ${i}` }),
    );

    const runner = new EmbeddingJobRunner(reader, writer, provider, store);
    const report = await runner.run({
      ownerId: 'owner-1',
      dryRun: true,
      batchSize: 10,
      maxMemories: 15,
    });

    expect(report.scanned).toBe(15);
    expect(report.embedded).toBe(15);
  });
});
