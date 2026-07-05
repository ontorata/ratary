import { describe, it, expect } from 'vitest';
import { rankTitleMode, suggestSimilarPaths } from '../../src/search/precision/fuzzy-title-matcher.js';
import type { Memory } from '../../src/types/memory.js';

const base = (overrides: Partial<Memory> = {}): Memory => ({
  id: '00000000-0000-0000-0000-000000000001',
  codename: null,
  slug: null,
  title: 'Architecture Notes',
  project: 'ratary',
  content: 'content',
  summary: 'summary',
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
  aliases: ['Arch Notes'],
  sourcePath: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  ...overrides,
});

describe('rankTitleMode', () => {
  it('boosts exact alias matches', () => {
    const ranked = rankTitleMode([base()], 'Arch Notes', 3, 500);
    expect(ranked[0].relevanceScore).toBeGreaterThanOrEqual(500);
  });
});

describe('suggestSimilarPaths', () => {
  it('returns closest path suggestions', () => {
    const suggestions = suggestSimilarPaths('vault/notes/architecture.md', [
      'vault/notes/architecture-guide.md',
      'vault/archive/old.md',
      'vault/other/readme.md',
    ]);
    expect(suggestions[0]).toBe('vault/notes/architecture-guide.md');
    expect(suggestions).toHaveLength(3);
  });
});
