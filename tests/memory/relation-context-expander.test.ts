import { describe, it, expect, beforeEach } from 'vitest';
import { expandWithRelationNeighbors } from '../../src/memory/retrieval-policy/relation-context-expander.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import {
  asSqlDatabase,
  createTestMemoryRepository,
  createTestRelationRepository,
} from '../helpers/sql-test-harness.js';

describe('expandWithRelationNeighbors', () => {
  const ownerId = 'owner-relations-expand';
  let repository: ReturnType<typeof createTestMemoryRepository>;
  let relationRepository: ReturnType<typeof createTestRelationRepository>;

  beforeEach(() => {
    const mockDb = new MockD1Client();
    repository = createTestMemoryRepository(mockDb);
    relationRepository = createTestRelationRepository(mockDb);
  });

  it('appends one-hop neighbor summaries to ranked set', async () => {
    const seed = await repository.insert({
      title: 'Seed memory',
      project: 'ai-brain',
      content: 'seed body',
      summary: 'seed summary',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 80,
      language: 'en',
      notes: '',
      codename: 'NOTE-0001',
      slug: 'seed-memory',
      favorite: false,
      ownerId,
      level: 'note',
    });

    const neighbor = await repository.insert({
      title: 'Neighbor memory',
      project: 'ai-brain',
      content: 'neighbor body',
      summary: 'neighbor summary',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 70,
      language: 'en',
      notes: '',
      codename: 'NOTE-0002',
      slug: 'neighbor-memory',
      favorite: false,
      ownerId,
      level: 'note',
    });

    await relationRepository.createFromInput(seed.id, ownerId, {
      targetMemoryId: neighbor.id,
      relation: 'related',
      sourceType: 'manual',
      confidence: 1,
    });

    const ranked = [{ ...seed, relevanceScore: 100 }];
    const expanded = await expandWithRelationNeighbors(
      repository,
      relationRepository,
      { ownerId },
      ranked,
      5,
    );

    expect(expanded.length).toBe(2);
    expect(expanded.some((memory) => memory.id === neighbor.id)).toBe(true);
  });
});
