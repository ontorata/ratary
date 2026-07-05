import { describe, it, expect } from 'vitest';
import { Ranker, applyRetrievalBoosts } from '../../src/memory/ranker.js';
import type { Memory } from '../../src/types/memory.js';

const baseMemory = (overrides: Partial<Memory> = {}): Memory => ({
  id: '00000000-0000-4000-8000-000000000001',
  codename: 'NOTE-0001',
  slug: 'note',
  title: 'Base',
  project: 'ai-brain',
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
  projectId: 'ai-brain',
  level: 'note',
  lastAccessed: null,
  accessCount: 0,
  embeddingId: null,
  objectKey: null,
  semanticHash: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('Ranker', () => {
  const ranker = new Ranker();

  it('should boost canonical level above raw', () => {
    const canonical = applyRetrievalBoosts({
      ...baseMemory({ level: 'canonical', title: 'Canon' }),
      relevanceScore: 10,
    });
    const raw = applyRetrievalBoosts({
      ...baseMemory({ level: 'raw', title: 'Raw' }),
      relevanceScore: 10,
    });

    expect(canonical.relevanceScore).toBeGreaterThan(raw.relevanceScore);
  });

  it('should return top-K results only', () => {
    const memories = Array.from({ length: 15 }, (_, i) =>
      baseMemory({
        id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
        title: `Item ${i}`,
        updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
      }),
    );

    const ranked = ranker.rank(memories, {}, 5);
    expect(ranked).toHaveLength(5);
  });

  it('should boost access count when ranking snapshot increases access weight', () => {
    const withSnapshot = applyRetrievalBoosts(
      { ...baseMemory({ accessCount: 10 }), relevanceScore: 10 },
      {
        snapshotId: 's1',
        ownerId: 'owner',
        version: 1,
        retrievalWeightMultipliers: { accessCountLog: 1.2 },
        createdAt: new Date().toISOString(),
      },
    );
    const baseline = applyRetrievalBoosts({
      ...baseMemory({ accessCount: 10 }),
      relevanceScore: 10,
    });

    expect(withSnapshot.relevanceScore).toBeGreaterThan(baseline.relevanceScore);
  });

  it('should rank higher importance above lower when query relevance matches (D85-04)', () => {
    const lower = baseMemory({
      id: '00000000-0000-4000-8000-000000000001',
      importance: 50,
      title: 'Signal topic alpha',
    });
    const higher = baseMemory({
      id: '00000000-0000-4000-8000-000000000002',
      importance: 55,
      title: 'Signal topic alpha',
    });

    const ranked = ranker.rank([lower, higher], { q: 'Signal topic' });
    expect(ranked[0]!.id).toBe(higher.id);
    expect(ranked[0]!.importance).toBeGreaterThan(ranked[1]!.importance);
  });

  it('should reorder after helpful signal delta changes importance (D85-04)', () => {
    const beforeSignal = baseMemory({
      id: '00000000-0000-4000-8000-000000000001',
      importance: 50,
      title: 'Feedback target',
    });
    const competitor = baseMemory({
      id: '00000000-0000-4000-8000-000000000002',
      importance: 52,
      title: 'Feedback target',
    });
    const afterSignal = baseMemory({
      id: beforeSignal.id,
      importance: 55,
      title: 'Feedback target',
    });

    const rankedBefore = ranker.rank([beforeSignal, competitor], { q: 'Feedback' });
    expect(rankedBefore[0]!.id).toBe(competitor.id);

    const rankedAfter = ranker.rank([afterSignal, competitor], { q: 'Feedback' });
    expect(rankedAfter[0]!.id).toBe(afterSignal.id);
  });
});
