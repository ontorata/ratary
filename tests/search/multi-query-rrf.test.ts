import { describe, it, expect } from 'vitest';
import { MultiQueryRrfFusion } from '../../src/search/precision/multi-query-rrf.js';
import type { Memory } from '../../src/types/memory.js';

const memory = (id: string, title: string): Memory => ({
  id,
  codename: null,
  slug: null,
  title,
  project: 'ratary',
  content: title,
  summary: title,
  keywords: [],
  category: '',
  memoryType: 'note',
  importance: 50,
  language: 'id',
  notes: '',
  tags: [],
  favorite: false,
  archived: false,
  ownerId: 'owner',
  projectId: 'ratary',
  level: 'note',
  lastAccessed: null,
  accessCount: 0,
  embeddingId: null,
  objectKey: null,
  semanticHash: null,
  aliases: [],
  sourcePath: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
});

describe('MultiQueryRrfFusion', () => {
  it('merges two query rankings with shared top hit', () => {
    const fusion = new MultiQueryRrfFusion();
    const perQuery = new Map([
      ['auth', [{ ...memory('1', 'Auth'), relevanceScore: 100 }, { ...memory('2', 'JWT'), relevanceScore: 80 }]],
      ['jwt', [{ ...memory('1', 'Auth'), relevanceScore: 90 }, { ...memory('3', 'Token'), relevanceScore: 70 }]],
    ]);

    const merged = fusion.fuse(perQuery, { k: 60 });
    expect(merged[0].id).toBe('1');
    expect(merged.map((item) => item.id)).toEqual(expect.arrayContaining(['2', '3']));
  });
});
