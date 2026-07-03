import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VectorRetrievalCandidateSource } from '../../src/memory/vector-retrieval-candidate-source.js';
import type { IEmbeddingStore } from '../../src/embedding/embedding.store.interface.js';
import type { IEmbeddingProvider, EmbeddingResult } from '../../src/embedding/embedding.provider.interface.js';
import type { IMemoryReader } from '../../src/repositories/memory.repository.interface.js';
import type { Memory } from '../../src/types/memory.js';

describe('VectorRetrievalCandidateSource', () => {
  let source: VectorRetrievalCandidateSource;
  let mockEmbeddingStore: IEmbeddingStore;
  let mockEmbeddingProvider: IEmbeddingProvider;
  let mockMemoryReader: IMemoryReader;

  const mockMemory: Memory = {
    id: 'mem-1',
    title: 'Test Memory',
    project: 'test-project',
    projectId: 'test-project',
    content: 'Test content',
    summary: 'Test summary',
    tags: ['test'],
    keywords: ['test'],
    category: 'test',
    memoryType: 'note',
    importance: 50,
    language: 'id',
    notes: '',
    favorite: false,
    archived: false,
    ownerId: 'owner-1',
    codename: 'TEST-001',
    slug: 'test-memory',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    accessCount: 0,
    lastAccessed: null,
    embeddingId: null,
    objectKey: null,
    semanticHash: null,
    level: 'note',
  };

  beforeEach(() => {
    mockEmbeddingStore = {
      upsert: vi.fn(),
      deleteByMemoryId: vi.fn(),
      deleteAllByOwner: vi.fn(),
      findByMemoryId: vi.fn(),
      searchSimilar: vi.fn(),
    };

    mockEmbeddingProvider = {
      modelId: 'test-model',
      dimensions: 1536,
      embed: vi.fn(),
    };

    mockMemoryReader = {
      slugExists: vi.fn(),
      findById: vi.fn(),
      findByIds: vi.fn(),
      findByCodename: vi.fn(),
      findBySlug: vi.fn(),
      findAll: vi.fn(),
      findSearchCandidates: vi.fn(),
      search: vi.fn(),
      listDistinctCategories: vi.fn(),
      listProjects: vi.fn(),
      listTags: vi.fn(),
      findAllByOwner: vi.fn(),
      findWithoutCodename: vi.fn(),
      findWithoutEmbedding: vi.fn(),
      findRetrievalCandidates: vi.fn(),
      findDuplicatesBySemanticHash: vi.fn(),
      findStaleCandidates: vi.fn(),
    };

    source = new VectorRetrievalCandidateSource(
      mockEmbeddingStore,
      mockEmbeddingProvider,
      mockMemoryReader,
    );
  });

  it('should implement IRetrievalCandidateSource interface', () => {
    expect(source).toBeDefined();
    expect(typeof source.findCandidates).toBe('function');
  });

  it('should return empty array when query is empty', async () => {
    const result = await source.findCandidates({
      ownerId: 'owner-1',
      maxCandidates: 10,
      query: '',
    });

    expect(result).toEqual([]);
    expect(mockEmbeddingProvider.embed).not.toHaveBeenCalled();
  });

  it('should return empty array when embedding provider returns no results', async () => {
    vi.mocked(mockEmbeddingProvider.embed).mockResolvedValue([]);

    const result = await source.findCandidates({
      ownerId: 'owner-1',
      maxCandidates: 10,
      query: 'test query',
    });

    expect(result).toEqual([]);
  });

  it('should return empty array when searchSimilar returns no matches', async () => {
    const mockEmbedding: EmbeddingResult = {
      memoryId: '__query__',
      vector: [0.1, 0.2, 0.3],
      modelId: 'test-model',
      dimensions: 3,
    };
    vi.mocked(mockEmbeddingProvider.embed).mockResolvedValue([mockEmbedding]);
    vi.mocked(mockEmbeddingStore.searchSimilar).mockResolvedValue([]);

    const result = await source.findCandidates({
      ownerId: 'owner-1',
      maxCandidates: 10,
      query: 'test query',
    });

    expect(result).toEqual([]);
  });

  it('should return hydrated memories in similarity ranking order', async () => {
    const mockEmbedding: EmbeddingResult = {
      memoryId: '__query__',
      vector: [0.1, 0.2, 0.3],
      modelId: 'test-model',
      dimensions: 3,
    };
    vi.mocked(mockEmbeddingProvider.embed).mockResolvedValue([mockEmbedding]);

    const memory2: Memory = { ...mockMemory, id: 'mem-2', title: 'Memory 2' };
    const memory3: Memory = { ...mockMemory, id: 'mem-3', title: 'Memory 3' };

    vi.mocked(mockEmbeddingStore.searchSimilar).mockResolvedValue([
      { memoryId: 'mem-1', embeddingId: 'emb-1', score: 0.9 },
      { memoryId: 'mem-2', embeddingId: 'emb-2', score: 0.8 },
      { memoryId: 'mem-3', embeddingId: 'emb-3', score: 0.7 },
    ]);

    vi.mocked(mockMemoryReader.findByIds).mockResolvedValue([memory2, mockMemory, memory3]);

    const result = await source.findCandidates({
      ownerId: 'owner-1',
      maxCandidates: 10,
      query: 'test query',
    });

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('mem-1');
    expect(result[1].id).toBe('mem-2');
    expect(result[2].id).toBe('mem-3');
  });

  it('should skip missing memories when hydrating', async () => {
    const mockEmbedding: EmbeddingResult = {
      memoryId: '__query__',
      vector: [0.1, 0.2, 0.3],
      modelId: 'test-model',
      dimensions: 3,
    };
    vi.mocked(mockEmbeddingProvider.embed).mockResolvedValue([mockEmbedding]);

    // Only return 2 of 3 memories (mem-2 is missing)
    vi.mocked(mockEmbeddingStore.searchSimilar).mockResolvedValue([
      { memoryId: 'mem-1', embeddingId: 'emb-1', score: 0.9 },
      { memoryId: 'mem-2', embeddingId: 'emb-2', score: 0.8 },
      { memoryId: 'mem-3', embeddingId: 'emb-3', score: 0.7 },
    ]);

    vi.mocked(mockMemoryReader.findByIds).mockResolvedValue([mockMemory]);

    const result = await source.findCandidates({
      ownerId: 'owner-1',
      maxCandidates: 10,
      query: 'test query',
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('mem-1');
  });

  it('should respect maxCandidates limit', async () => {
    const mockEmbedding: EmbeddingResult = {
      memoryId: '__query__',
      vector: [0.1, 0.2, 0.3],
      modelId: 'test-model',
      dimensions: 3,
    };
    vi.mocked(mockEmbeddingProvider.embed).mockResolvedValue([mockEmbedding]);

    // 3 matches from vector store
    vi.mocked(mockEmbeddingStore.searchSimilar).mockResolvedValue([
      { memoryId: 'mem-1', embeddingId: 'emb-1', score: 0.9 },
      { memoryId: 'mem-2', embeddingId: 'emb-2', score: 0.8 },
      { memoryId: 'mem-3', embeddingId: 'emb-3', score: 0.7 },
    ]);

    vi.mocked(mockMemoryReader.findByIds).mockResolvedValue([mockMemory]);

    await source.findCandidates({
      ownerId: 'owner-1',
      maxCandidates: 2, // limit to 2
      query: 'test query',
    });

    // Verify the limit was passed to searchSimilar
    expect(mockEmbeddingStore.searchSimilar).toHaveBeenCalledWith(
      expect.any(Array),
      'owner-1',
      2,
    );
  });
});
