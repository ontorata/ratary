import { describe, expect, it } from 'vitest';
import { Ranker } from './ranker.js';
import type { Memory } from '../types/memory.js';

function memory(id: string, importance: number): Memory {
  return {
    id,
    ownerId: 'owner',
    title: `${id} test note`,
    content: 'body',
    summary: '',
    project: 'p',
    tags: [],
    keywords: [],
    favorite: false,
    archived: false,
    importance,
    accessCount: 0,
    level: 'note',
    codename: null,
    slug: null,
    category: '',
    memoryType: 'note',
    language: 'en',
    notes: '',
    projectId: '',
    lastAccessed: null,
    embeddingId: null,
    objectKey: null,
    semanticHash: null,
    aliases: [],
    sourcePath: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('Ranker', () => {
  it('orders higher importance memories first when base relevance matches (D85-04)', () => {
    const ranker = new Ranker();
    const ranked = ranker.rank(
      [memory('low', 1), memory('high', 90)],
      { q: 'test' },
      10,
    );

    expect(ranked[0]?.id).toBe('high');
    expect(ranked[1]?.id).toBe('low');
    expect(ranked[0]!.relevanceScore).toBeGreaterThan(ranked[1]!.relevanceScore);
  });
});
