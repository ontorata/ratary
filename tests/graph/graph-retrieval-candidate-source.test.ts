import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphRetrievalCandidateSource } from '../../src/graph/graph-retrieval-candidate-source.js';
import type { IGraphProvider, GraphNeighbor } from '../../src/graph/igraph-provider.interface.js';
import type { IMemoryReader } from '../../src/repositories/memory.repository.interface.js';
import type { Memory } from '../../src/types/memory.js';
import {
  DEFAULT_GRAPH_MAX_DEPTH,
  DEFAULT_GRAPH_MAX_NEIGHBORS,
  DEFAULT_GRAPH_SEED_CAP,
} from '../../src/graph/graph.config.js';

const ownerId = 'owner-1';

function makeMemory(id: string, overrides: Partial<Memory> = {}): Memory {
  return {
    id,
    title: `Memory ${id}`,
    project: 'test-project',
    projectId: 'test-project',
    content: 'content',
    summary: 'summary',
    tags: ['test'],
    keywords: ['test'],
    category: 'test',
    memoryType: 'note',
    importance: 50,
    language: 'id',
    notes: '',
    favorite: false,
    archived: false,
    ownerId,
    codename: null,
    slug: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    accessCount: 0,
    lastAccessed: null,
    embeddingId: null,
    objectKey: null,
    semanticHash: null,
    level: 'note',
    ...overrides,
  };
}

function neighbor(memoryId: string): GraphNeighbor {
  return {
    memoryId,
    depth: 1,
    relationType: 'related',
    direction: 'outgoing',
  };
}

describe('GraphRetrievalCandidateSource', () => {
  let graphProvider: IGraphProvider;
  let memoryReader: IMemoryReader;
  let source: GraphRetrievalCandidateSource;

  beforeEach(() => {
    graphProvider = {
      traverseNeighbors: vi.fn(),
      getCapabilities: vi.fn(),
    };

    memoryReader = {
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

    source = new GraphRetrievalCandidateSource(graphProvider, memoryReader, {
      seedCap: DEFAULT_GRAPH_SEED_CAP,
      maxDepth: DEFAULT_GRAPH_MAX_DEPTH,
      maxNeighbors: DEFAULT_GRAPH_MAX_NEIGHBORS,
    });
  });

  it('should implement IRetrievalCandidateSource interface', () => {
    expect(typeof source.findCandidates).toBe('function');
  });

  it('should return empty array when query is absent', async () => {
    const result = await source.findCandidates({
      ownerId,
      maxCandidates: 100,
    });

    expect(result).toEqual([]);
    expect(memoryReader.findRetrievalCandidates).not.toHaveBeenCalled();
    expect(graphProvider.traverseNeighbors).not.toHaveBeenCalled();
  });

  it('should return empty array when no lexical seeds match', async () => {
    vi.mocked(memoryReader.findRetrievalCandidates).mockResolvedValue([]);

    const result = await source.findCandidates({
      ownerId,
      maxCandidates: 100,
      query: 'auth flow',
    });

    expect(result).toEqual([]);
    expect(graphProvider.traverseNeighbors).not.toHaveBeenCalled();
  });

  it('should fetch seeds with seedCap and propagate retrieval filters', async () => {
    vi.mocked(memoryReader.findRetrievalCandidates).mockResolvedValue([]);
    const filters = {
      ownerId,
      maxCandidates: 100,
      query: 'jwt',
      projectId: 'proj-a',
      tags: ['security'],
      levels: ['note' as const],
    };

    await source.findCandidates(filters);

    expect(memoryReader.findRetrievalCandidates).toHaveBeenCalledWith({
      ...filters,
      maxCandidates: DEFAULT_GRAPH_SEED_CAP,
    });
  });

  it('should exclude seed memories from graph output', async () => {
    const seed = makeMemory('seed-1');
    vi.mocked(memoryReader.findRetrievalCandidates).mockResolvedValue([seed]);
    vi.mocked(graphProvider.traverseNeighbors).mockResolvedValue([
      neighbor('seed-1'),
      neighbor('neighbor-1'),
    ]);
    vi.mocked(memoryReader.findByIds).mockResolvedValue([makeMemory('neighbor-1')]);

    const result = await source.findCandidates({
      ownerId,
      maxCandidates: 100,
      query: 'jwt',
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('neighbor-1');
  });

  it('should hydrate neighbors in discovery order across seeds', async () => {
    const seed1 = makeMemory('seed-1');
    const seed2 = makeMemory('seed-2');
    vi.mocked(memoryReader.findRetrievalCandidates).mockResolvedValue([seed1, seed2]);

    vi.mocked(graphProvider.traverseNeighbors)
      .mockResolvedValueOnce([neighbor('n-from-seed-1')])
      .mockResolvedValueOnce([neighbor('n-from-seed-2')]);

    vi.mocked(memoryReader.findByIds).mockResolvedValue([
      makeMemory('n-from-seed-2'),
      makeMemory('n-from-seed-1'),
    ]);

    const result = await source.findCandidates({
      ownerId,
      maxCandidates: 100,
      query: 'graph',
    });

    expect(result.map((m) => m.id)).toEqual(['n-from-seed-1', 'n-from-seed-2']);
    expect(memoryReader.findByIds).toHaveBeenCalledWith(
      ['n-from-seed-1', 'n-from-seed-2'],
      ownerId,
    );
  });

  it('should share neighbor budget across seeds', async () => {
    const seeds = [makeMemory('seed-1'), makeMemory('seed-2'), makeMemory('seed-3')];
    vi.mocked(memoryReader.findRetrievalCandidates).mockResolvedValue(seeds);

    vi.mocked(graphProvider.traverseNeighbors).mockImplementation(async (_seed, _owner, opts) => {
      const count = Math.min(2, opts.remainingBudget);
      return Array.from({ length: count }, (_, i) => neighbor(`n-${_seed}-${i}`));
    });

    vi.mocked(memoryReader.findByIds).mockImplementation(async (ids) =>
      ids.map((id) => makeMemory(id)),
    );

    source = new GraphRetrievalCandidateSource(graphProvider, memoryReader, {
      seedCap: 3,
      maxDepth: 2,
      maxNeighbors: 3,
    });

    const result = await source.findCandidates({
      ownerId,
      maxCandidates: 100,
      query: 'budget test',
    });

    expect(result).toHaveLength(3);
    expect(graphProvider.traverseNeighbors).toHaveBeenCalledTimes(2);
    expect(vi.mocked(graphProvider.traverseNeighbors).mock.calls[0][2].remainingBudget).toBe(3);
    expect(vi.mocked(graphProvider.traverseNeighbors).mock.calls[1][2].remainingBudget).toBe(1);
  });

  it('should drop archived memories after hydration', async () => {
    const seed = makeMemory('seed-1');
    vi.mocked(memoryReader.findRetrievalCandidates).mockResolvedValue([seed]);
    vi.mocked(graphProvider.traverseNeighbors).mockResolvedValue([
      neighbor('active-1'),
      neighbor('archived-1'),
    ]);
    vi.mocked(memoryReader.findByIds).mockResolvedValue([
      makeMemory('active-1'),
      makeMemory('archived-1', { archived: true }),
    ]);

    const result = await source.findCandidates({
      ownerId,
      maxCandidates: 100,
      query: 'archived filter',
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('active-1');
  });

  it('should pass traversal options from config to graph provider', async () => {
    const seed = makeMemory('seed-1');
    vi.mocked(memoryReader.findRetrievalCandidates).mockResolvedValue([seed]);
    vi.mocked(graphProvider.traverseNeighbors).mockResolvedValue([]);
    vi.mocked(memoryReader.findByIds).mockResolvedValue([]);

    source = new GraphRetrievalCandidateSource(graphProvider, memoryReader, {
      seedCap: 2,
      maxDepth: 3,
      maxNeighbors: 10,
      relationTypes: ['depends_on'],
    });

    await source.findCandidates({
      ownerId,
      maxCandidates: 100,
      query: 'deps',
    });

    expect(graphProvider.traverseNeighbors).toHaveBeenCalledWith('seed-1', ownerId, {
      maxDepth: 3,
      remainingBudget: 10,
      relationTypes: ['depends_on'],
    });
  });

  it('should dedupe neighbors discovered from multiple seeds', async () => {
    const seed1 = makeMemory('seed-1');
    const seed2 = makeMemory('seed-2');
    vi.mocked(memoryReader.findRetrievalCandidates).mockResolvedValue([seed1, seed2]);

    vi.mocked(graphProvider.traverseNeighbors)
      .mockResolvedValueOnce([neighbor('shared-neighbor')])
      .mockResolvedValueOnce([neighbor('shared-neighbor'), neighbor('unique-neighbor')]);

    vi.mocked(memoryReader.findByIds).mockResolvedValue([
      makeMemory('shared-neighbor'),
      makeMemory('unique-neighbor'),
    ]);

    const result = await source.findCandidates({
      ownerId,
      maxCandidates: 100,
      query: 'dedupe',
    });

    expect(result.map((m) => m.id)).toEqual(['shared-neighbor', 'unique-neighbor']);
    expect(memoryReader.findByIds).toHaveBeenCalledWith(
      ['shared-neighbor', 'unique-neighbor'],
      ownerId,
    );
  });
});
