import { describe, expect, it } from 'vitest';
import {
  createContextPackageEnvelope,
  deriveContextConfidence,
  buildSourceLabels,
  CONTEXT_PACKAGE_UPDATE_MECHANISM,
} from './context-package-envelope.js';
import type { ScoredMemory } from './ranker.js';

function memory(partial: {
  id: string;
  relevanceScore: number;
  codename?: string | null;
  title?: string;
}): ScoredMemory {
  return {
    id: partial.id,
    codename: partial.codename ?? null,
    slug: null,
    title: partial.title ?? 'T',
    project: 'p',
    content: 'c',
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
    updatedAt: '2026-01-01T00:00:00.000Z',
    accessCount: 0,
    lastAccessed: null,
    relevanceScore: partial.relevanceScore,
  } as unknown as ScoredMemory;
}

describe('context-package-envelope (ADR-1011)', () => {
  it('marks empty retrieval as low confidence with stable updateMechanism', () => {
    expect(deriveContextConfidence([])).toBe('low');
    const envelope = createContextPackageEnvelope({
      scope: { ownerId: 'owner-1' },
      query: 'q',
      memories: [],
      packageId: 'pkg-fixed',
      now: () => new Date('2026-07-31T00:00:00.000Z'),
    });
    expect(envelope).toMatchObject({
      packageId: 'pkg-fixed',
      ownerId: 'owner-1',
      createdAt: '2026-07-31T00:00:00.000Z',
      confidence: 'low',
      updateMechanism: CONTEXT_PACKAGE_UPDATE_MECHANISM,
      query: 'q',
      sourceLabels: [],
    });
  });

  it('derives confidence from top relevance score and source labels from codename/title', () => {
    const high = memory({ id: 'a', relevanceScore: 0.9, codename: 'ARCH-1', title: 'Ignore' });
    const mid = memory({ id: 'b', relevanceScore: 0.4, title: 'Mid title' });
    expect(deriveContextConfidence([high])).toBe('high');
    expect(deriveContextConfidence([mid])).toBe('medium');
    expect(buildSourceLabels([high, mid])).toEqual(['ARCH-1', 'Mid title']);
  });
});
