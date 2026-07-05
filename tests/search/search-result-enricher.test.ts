import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchResultEnricher } from '../../src/search/precision/search-result-enricher.js';
import type { IMemoryReader } from '../../src/repositories/memory.repository.interface.js';
import type { IMemoryRelationRepository } from '../../src/repositories/memory-relation.repository.interface.js';
import type { MemoryScope } from '../../src/types/memory-scope.js';

const scope: MemoryScope = { ownerId: 'owner-1' };

describe('SearchResultEnricher', () => {
  const reader = {
    findByIds: vi.fn(async () => [{ id: 'target-1', title: 'Target Memory' }]),
  } as unknown as IMemoryReader;

  const relations = {
    findByMemoryId: vi.fn(async () => [
      {
        id: 'rel-1',
        sourceMemoryId: 'seed-1',
        targetMemoryId: 'target-1',
        relation: 'related',
        ownerId: 'owner-1',
        weight: 1,
        confidence: 1,
        createdBy: null,
        sourceType: 'manual',
        metadata: {},
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]),
  } as unknown as IMemoryRelationRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds snippet and capped relation envelope when extended', async () => {
    const enricher = new SearchResultEnricher(reader, relations);
    const hits = await enricher.enrich(
      scope,
      [
        {
          id: 'seed-1',
          title: 'Seed',
          summary: 'Find architecture details here',
          content: 'body',
          relevanceScore: 90,
        } as never,
      ],
      { query: 'architecture', snippetLength: 20, linkCap: 1, extended: true },
    );

    expect(hits[0].snippet).toContain('architecture');
    expect(hits[0].outgoingLinks).toHaveLength(1);
    expect(hits[0].outgoingLinks?.[0].title).toBe('Target Memory');
  });
});
