import { describe, it, expect } from 'vitest';
import { DefaultRelationScoringPolicy } from '../../src/inference/default-relation-scoring-policy.js';
import type { InferredRelationCandidate } from '../../src/inference/relation-inference.types.js';

describe('DefaultRelationScoringPolicy', () => {
  const policy = new DefaultRelationScoringPolicy();

  it('merges duplicate edges and keeps max confidence', () => {
    const base: InferredRelationCandidate = {
      sourceMemoryId: 'a',
      targetMemoryId: 'b',
      relation: 'related',
      weight: 1,
      confidence: 0.5,
      inferenceSource: 'project',
      evidence: { projectId: 'p1' },
    };

    const scored = policy.score([
      base,
      { ...base, inferenceSource: 'shared_tag', confidence: 0.7, weight: 2 },
    ]);

    expect(scored).toHaveLength(1);
    expect(scored[0].finalConfidence).toBe(0.7);
    expect(scored[0].finalWeight).toBeGreaterThan(1);
  });

  it('filters below minimum confidence threshold', () => {
    const scored = policy.score([
      {
        sourceMemoryId: 'a',
        targetMemoryId: 'b',
        relation: 'related',
        weight: 1,
        confidence: 0.1,
        inferenceSource: 'temporal',
        evidence: {},
      },
    ]);

    expect(scored).toHaveLength(0);
  });
});
