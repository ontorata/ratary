import { describe, expect, it, vi } from 'vitest';
import { ContextService } from './context.service.js';
import { RetrievalMemoCache, buildRetrievalMemoKey } from './retrieval-memo-cache.js';
import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import type { Memory } from '../types/memory.js';

const scope = { ownerId: 'owner-1' };

function memory(id: string): Memory {
  return {
    id,
    codename: id,
    slug: null,
    title: id,
    project: 'p',
    content: `content-${id}`,
    summary: '',
    keywords: [],
    category: '',
    memoryType: 'note',
    importance: 50,
    language: 'en',
    notes: '',
    tags: [],
    favorite: false,
    archived: false,
    ownerId: 'owner-1',
    projectId: 'p',
    level: 'note',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-07-15T00:00:00.000Z',
    accessCount: 0,
    lastAccessed: null,
  } as unknown as Memory;
}

describe('RetrievalMemoCache (ADR-1018)', () => {
  it('expires entries by TTL and evicts oldest when full', () => {
    let now = 1_000;
    const cache = new RetrievalMemoCache(100, 2, () => now);
    cache.set('a', [], 0);
    cache.set('b', [], 0);
    expect(cache.size).toBe(2);
    cache.set('c', [], 0);
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).not.toBeNull();

    now = 1_200;
    expect(cache.get('b')).toBeNull();
  });

  it('buildContext remints packageId on memo hit and skips second retrieve', async () => {
    const findCandidates = vi.fn(async () => [memory('m1')]);
    const source: IRetrievalCandidateSource = { findCandidates };
    const repo = {
      recordAccessBatch: async () => undefined,
      findByIdsWithContent: async () => [memory('m1')],
    } as unknown as IMemoryRepository;

    const service = new ContextService(repo, source, undefined, {
      retrievalMemoCache: new RetrievalMemoCache(60_000, 16),
    });

    const first = await service.buildContext(scope, { query: 'same' });
    const second = await service.buildContext(scope, { query: 'same' });

    expect(findCandidates).toHaveBeenCalledTimes(1);
    expect(first.retrievalMemo).toBe('miss');
    expect(second.retrievalMemo).toBe('hit');
    expect(first.packageId).not.toBe(second.packageId);
    expect(first.context).toBe(second.context);
  });

  it('buildRetrievalMemoKey isolates owners', () => {
    const a = buildRetrievalMemoKey({ ownerId: 'o1', query: 'q', limit: 10 });
    const b = buildRetrievalMemoKey({ ownerId: 'o2', query: 'q', limit: 10 });
    expect(a).not.toBe(b);
  });
});
