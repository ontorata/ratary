import { describe, expect, it, vi } from 'vitest';
import { MeilisearchRetrievalSource } from '../../src/infrastructure/search/meilisearch/meilisearch-retrieval-source.js';
import type { IMemoryReader } from '../../src/repositories/memory.repository.interface.js';
import type { Memory } from '../../src/types/memory.js';

function createMemory(id: string): Memory {
  return {
    id,
    title: `Memory ${id}`,
    project: 'demo',
    projectId: 'demo',
    content: 'content',
    summary: 'summary',
    tags: [],
    keywords: [],
    category: '',
    memoryType: 'note',
    importance: 50,
    language: 'en',
    notes: '',
    codename: `NOTE-${id}`,
    slug: id,
    favorite: false,
    ownerId: 'owner-a',
    archived: false,
    level: 'working',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    accessCount: 0,
    lastAccessed: null,
    semanticHash: null,
    embeddingId: null,
    objectKey: null,
  };
}

describe('MeilisearchRetrievalSource', () => {
  it('should search meilisearch and hydrate memories in rank order', async () => {
    const reader: IMemoryReader = {
      findByIds: vi.fn(async () => [createMemory('mem-2'), createMemory('mem-1')]),
    } as unknown as IMemoryReader;

    const source = new MeilisearchRetrievalSource(
      {
        search: vi.fn(async () => ({ hits: [{ id: 'mem-1' }, { id: 'mem-2' }] })),
      },
      reader,
      { index: 'memories' },
    );

    const results = await source.findCandidates({
      ownerId: 'owner-a',
      workspaceId: 'ws-1',
      query: 'jwt refresh',
      maxCandidates: 5,
    });

    expect(results.map((memory) => memory.id)).toEqual(['mem-1', 'mem-2']);
  });
});
