import { describe, it, expect } from 'vitest';
import { DefaultInspectionConfidencePolicy } from '../../src/learning/inspection/default-inspection-confidence-policy.js';
import type { InspectionPattern } from '../../src/learning/inspection/inspection-pattern.types.js';

function basePattern(overrides: Partial<InspectionPattern> = {}): InspectionPattern {
  return {
    id: 'p1',
    ownerId: 'owner-1',
    patternKey: 'testing:abc',
    patternScope: 'workspace',
    category: 'testing',
    trigger: { paths: ['src/'] },
    description: 'test',
    confidence: 70,
    evidenceCount: 2,
    protected: false,
    disabled: false,
    lifecycleState: 'active',
    lastConfirmedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('DefaultInspectionConfidencePolicy (8.8C)', () => {
  const policy = new DefaultInspectionConfidencePolicy();

  it('computes confidence from evidence count', () => {
    expect(policy.confidenceForEvidence(2)).toBe(70);
    expect(policy.confidenceForEvidence(5)).toBe(100);
  });

  it('decays aging patterns unless protected', () => {
    const refreshed = policy.refresh(basePattern(), '2026-07-05T00:00:00.000Z');
    expect(refreshed.lifecycleState).toBe('aging');
    expect(refreshed.confidence).toBeLessThan(70);
  });

  it('skips decay for protected patterns', () => {
    const refreshed = policy.refresh(
      basePattern({ protected: true }),
      '2026-07-05T00:00:00.000Z',
    );
    expect(refreshed.confidence).toBe(70);
    expect(refreshed.lifecycleState).toBe('active');
  });
});
