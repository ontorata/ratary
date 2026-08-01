import { describe, expect, it } from 'vitest';
import {
  createContextPackageEnvelope,
  deriveContextConfidence,
  deriveContextConfidenceHeuristic,
  deriveContextConfidenceProduct,
  buildSourceLabels,
  canTransitionContextPackageLifecycle,
  CONTEXT_PACKAGE_UPDATE_MECHANISM,
  CONTEXT_PACKAGE_CONFIDENCE_MODEL_PRODUCT,
} from './context-package-envelope.js';
import type { ScoredMemory } from './ranker.js';

function memory(partial: {
  id: string;
  relevanceScore: number;
  codename?: string | null;
  title?: string;
  importance?: number;
  updatedAt?: string;
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
    importance: partial.importance ?? 50,
    language: 'en',
    notes: '',
    tags: [],
    favorite: false,
    archived: false,
    ownerId: 'owner-1',
    projectId: 'p',
    level: 'note',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: partial.updatedAt ?? '2026-07-15T00:00:00.000Z',
    accessCount: 0,
    lastAccessed: null,
    relevanceScore: partial.relevanceScore,
  } as unknown as ScoredMemory;
}

describe('context-package-envelope (ADR-1011 / 1016)', () => {
  it('marks empty retrieval as low confidence with product model on mint', () => {
    expect(deriveContextConfidence([])).toBe('low');
    expect(deriveContextConfidenceProduct([])).toBe('low');
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
      confidenceModel: CONTEXT_PACKAGE_CONFIDENCE_MODEL_PRODUCT,
      updateMechanism: CONTEXT_PACKAGE_UPDATE_MECHANISM,
      lifecycleState: 'active',
      query: 'q',
      sourceLabels: [],
    });
  });

  it('keeps heuristic thresholds and labels source order', () => {
    const high = memory({ id: 'a', relevanceScore: 0.9, codename: 'ARCH-1', title: 'Ignore' });
    const mid = memory({ id: 'b', relevanceScore: 0.4, title: 'Mid title' });
    expect(deriveContextConfidenceHeuristic([high])).toBe('high');
    expect(deriveContextConfidenceHeuristic([mid])).toBe('medium');
    expect(buildSourceLabels([high, mid])).toEqual(['ARCH-1', 'Mid title']);
  });

  it('scores confidence-product-v1 from multi-signal inputs', () => {
    const strong = [
      memory({
        id: 'a',
        relevanceScore: 1.2,
        importance: 90,
        codename: 'A',
        updatedAt: '2026-07-20T00:00:00.000Z',
      }),
      memory({
        id: 'b',
        relevanceScore: 1.0,
        importance: 80,
        codename: 'B',
        updatedAt: '2026-07-18T00:00:00.000Z',
      }),
      memory({
        id: 'c',
        relevanceScore: 0.9,
        importance: 70,
        title: 'C',
        updatedAt: '2026-07-10T00:00:00.000Z',
      }),
    ];
    expect(deriveContextConfidenceProduct(strong, Date.parse('2026-07-31T00:00:00.000Z'))).toBe(
      'high',
    );

    const weak = [
      memory({
        id: 'w',
        relevanceScore: 0.1,
        importance: 10,
        updatedAt: '2024-01-01T00:00:00.000Z',
      }),
    ];
    expect(deriveContextConfidenceProduct(weak, Date.parse('2026-07-31T00:00:00.000Z'))).toBe(
      'low',
    );
  });

  it('allows ADR-1013 lifecycle transitions and rejects draft/reverse moves', () => {
    expect(canTransitionContextPackageLifecycle('active', 'retired')).toBe(true);
    expect(canTransitionContextPackageLifecycle('active', 'archived')).toBe(true);
    expect(canTransitionContextPackageLifecycle('retired', 'archived')).toBe(true);
    expect(canTransitionContextPackageLifecycle('archived', 'active')).toBe(false);
    expect(canTransitionContextPackageLifecycle('retired', 'active')).toBe(false);
    expect(canTransitionContextPackageLifecycle('active', 'active')).toBe(false);
  });
});
