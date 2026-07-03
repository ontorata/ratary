import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphService } from '../../src/services/graph.service.js';
import type { IGraphProvider, GraphNeighbor } from '../../src/graph/igraph-provider.interface.js';
import type { IMemoryReader } from '../../src/repositories/memory.repository.interface.js';
import type { Memory } from '../../src/types/memory.js';
import { NotFoundError } from '../../src/types/errors.js';

const ownerId = 'owner-1';
const seedId = '00000000-0000-0000-0000-000000000001';

function makeMemory(id: string): Memory {
  return {
    id,
    title: 'Seed',
    project: 'p',
    projectId: 'p',
    content: 'content',
    summary: '',
    tags: [],
    keywords: [],
    category: '',
    memoryType: 'note',
    importance: 50,
    language: 'en',
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
  };
}

describe('GraphService', () => {
  let graphProvider: IGraphProvider;
  let memoryReader: IMemoryReader;
  let service: GraphService;

  beforeEach(() => {
    graphProvider = {
      traverseNeighbors: vi.fn(),
      getCapabilities: vi.fn().mockReturnValue({
        supportsTraversal: true,
        supportsBFS: true,
        supportsBidirectional: true,
        maxTraversalDepth: 2,
        maxNeighborsPerRequest: 30,
      }),
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

    service = new GraphService(graphProvider, memoryReader, {
      maxDepth: 2,
      maxNeighbors: 30,
      graphRetrievalEnabled: true,
    });
  });

  it('should expose capabilities with graphRetrievalEnabled flag', () => {
    expect(service.getCapabilities()).toEqual({
      supportsTraversal: true,
      supportsBFS: true,
      supportsBidirectional: true,
      maxTraversalDepth: 2,
      maxNeighborsPerRequest: 30,
      graphRetrievalEnabled: true,
    });
  });

  it('should throw NotFoundError when seed memory is missing', async () => {
    vi.mocked(memoryReader.findById).mockResolvedValue(null);

    await expect(
      service.traverseRelations({ ownerId }, { memoryId: seedId }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should traverse neighbors with configured depth and budget', async () => {
    const neighbor: GraphNeighbor = {
      memoryId: '00000000-0000-0000-0000-000000000002',
      depth: 1,
      relationType: 'related',
      direction: 'outgoing',
    };

    vi.mocked(memoryReader.findById).mockResolvedValue(makeMemory(seedId));
    vi.mocked(graphProvider.traverseNeighbors).mockResolvedValue([neighbor]);
    vi.mocked(memoryReader.findByIds).mockResolvedValue([makeMemory(neighbor.memoryId)]);

    const result = await service.traverseRelations(
      { ownerId },
      { memoryId: seedId, depth: 2, types: ['depends_on'] },
    );

    expect(graphProvider.traverseNeighbors).toHaveBeenCalledWith(seedId, ownerId, {
      maxDepth: 2,
      remainingBudget: 30,
      relationTypes: ['depends_on'],
    });
    expect(result.memoryIds).toEqual([neighbor.memoryId]);
    expect(result.neighbors).toEqual([neighbor]);
  });

  it('should clamp depth to MVP maximum', async () => {
    vi.mocked(memoryReader.findById).mockResolvedValue(makeMemory(seedId));
    vi.mocked(graphProvider.traverseNeighbors).mockResolvedValue([]);

    await service.traverseRelations({ ownerId }, { memoryId: seedId, depth: 5 });

    expect(graphProvider.traverseNeighbors).toHaveBeenCalledWith(
      seedId,
      ownerId,
      expect.objectContaining({ maxDepth: 3 }),
    );
  });

  it('should drop archived neighbors after hydration', async () => {
    vi.mocked(memoryReader.findById).mockResolvedValue(makeMemory(seedId));
    vi.mocked(graphProvider.traverseNeighbors).mockResolvedValue([
      {
        memoryId: '00000000-0000-0000-0000-000000000002',
        depth: 1,
        relationType: 'related',
        direction: 'outgoing',
      },
      {
        memoryId: '00000000-0000-0000-0000-000000000003',
        depth: 1,
        relationType: 'related',
        direction: 'outgoing',
      },
    ]);
    vi.mocked(memoryReader.findByIds).mockResolvedValue([
      { ...makeMemory('00000000-0000-0000-0000-000000000002'), archived: false },
      { ...makeMemory('00000000-0000-0000-0000-000000000003'), archived: true },
    ]);

    const result = await service.traverseRelations({ ownerId }, { memoryId: seedId });

    expect(result.memoryIds).toEqual(['00000000-0000-0000-0000-000000000002']);
    expect(result.neighbors).toHaveLength(1);
  });
});
