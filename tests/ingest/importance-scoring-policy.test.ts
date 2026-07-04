import { describe, it, expect } from 'vitest';
import { ImportanceScoringPolicy } from '../../src/ingest/importance-scoring-policy.js';

describe('ImportanceScoringPolicy', () => {
  const policy = new ImportanceScoringPolicy();

  it('applies bounded helpful feedback delta', () => {
    const delta = policy.score(
      {
        signalId: 's1',
        signalType: 'explicit_feedback',
        ownerId: 'o1',
        memoryId: 'm1',
        payload: { value: 'helpful' },
        observedAt: new Date().toISOString(),
      },
      { id: 'm1', importance: 50 },
    );

    expect(delta).toBe(5);
    expect(policy.applyDelta(50, delta)).toBe(55);
  });

  it('clamps importance at 0 and 100', () => {
    expect(policy.applyDelta(2, -5)).toBe(0);
    expect(policy.applyDelta(98, 5)).toBe(100);
  });
});
