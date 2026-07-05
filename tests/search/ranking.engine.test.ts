import { describe, it, expect } from 'vitest';
import { scoreMemory, rankMemories } from '../../src/search/ranking.engine.js';
import type { Memory } from '../../src/types/memory.js';

const baseMemory = (overrides: Partial<Memory> = {}): Memory => ({
  id: '00000000-0000-0000-0000-000000000001',
  codename: 'AUTH-0001',
  slug: 'fastify-auth',
  title: 'Fastify Auth',
  project: 'ai-brain',
  content: 'JWT middleware content',
  summary: 'Auth summary',
  keywords: ['auth', 'jwt'],
  category: 'Development',
  memoryType: 'architecture',
  importance: 80,
  language: 'id',
  notes: '',
  tags: ['auth'],
  favorite: true,
  archived: false,
  ownerId: 'owner',
  projectId: 'ai-brain',
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
  ...overrides,
});

describe('RankingEngine', () => {
  it('should score exact codename highest', () => {
    const score = scoreMemory(baseMemory(), { q: 'AUTH-0001' });
    expect(score).toBeGreaterThan(100);
  });

  it('should rank title match above content-only match', () => {
    const titleMatch = baseMemory({ title: 'JWT Guide' });
    const contentOnly = baseMemory({
      title: 'Other',
      codename: null,
      summary: '',
      keywords: [],
      tags: [],
      content: 'mentions JWT only in body',
    });

    const ranked = rankMemories([contentOnly, titleMatch], { q: 'JWT' });
    expect(ranked[0].id).toBe(titleMatch.id);
    expect(ranked[0].relevanceScore).toBeGreaterThanOrEqual(ranked[1].relevanceScore);
  });

  it('should tie-break by updatedAt desc', () => {
    const older = baseMemory({
      id: '00000000-0000-0000-0000-000000000002',
      updatedAt: '2026-01-01T00:00:00.000Z',
      favorite: false,
      importance: 50,
    });
    const newer = baseMemory({
      id: '00000000-0000-0000-0000-000000000003',
      updatedAt: '2026-01-03T00:00:00.000Z',
      favorite: false,
      importance: 50,
    });

    const ranked = rankMemories([older, newer], {});
    expect(ranked[0].id).toBe(newer.id);
  });
});
