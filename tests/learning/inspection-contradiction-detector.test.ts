import { describe, it, expect } from 'vitest';
import { detectInspectionContradictions } from '../../src/learning/inspection/inspection-contradiction-detector.js';
import type { InspectionPattern } from '../../src/learning/inspection/inspection-pattern.types.js';

describe('detectInspectionContradictions (8.8C)', () => {
  it('flags overlapping path scope with different categories', () => {
    const patterns: InspectionPattern[] = [
      {
        id: 'a',
        ownerId: 'owner-1',
        patternKey: 'boundary:1',
        patternScope: 'workspace',
        category: 'boundary',
        trigger: { paths: ['src/ingest/'] },
        description: 'boundary',
        confidence: 80,
        evidenceCount: 2,
        protected: false,
        disabled: false,
        lifecycleState: 'active',
        lastConfirmedAt: '2026-07-01T00:00:00.000Z',
        createdAt: '2026-07-01T00:00:00.000Z',
        updatedAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'b',
        ownerId: 'owner-1',
        patternKey: 'adr:1',
        patternScope: 'workspace',
        category: 'adr',
        trigger: { paths: ['src/ingest/other.ts'] },
        description: 'adr',
        confidence: 80,
        evidenceCount: 2,
        protected: false,
        disabled: false,
        lifecycleState: 'active',
        lastConfirmedAt: '2026-07-01T00:00:00.000Z',
        createdAt: '2026-07-01T00:00:00.000Z',
        updatedAt: '2026-07-01T00:00:00.000Z',
      },
    ];

    const contradictions = detectInspectionContradictions(
      'owner-1',
      patterns,
      '2026-07-05T00:00:00.000Z',
    );
    expect(contradictions).toHaveLength(1);
    expect(contradictions[0]?.patternIdA).toBe('a');
    expect(contradictions[0]?.patternIdB).toBe('b');
  });
});
