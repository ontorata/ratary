import { describe, it, expect } from 'vitest';
import { AdaptiveRetrievalPolicy } from '../../src/memory/retrieval-policy/adaptive-retrieval-policy.js';

describe('AdaptiveRetrievalPolicy', () => {
  const deployment = {
    hybridRetrieval: false,
    graphRetrieval: false,
    maxContextMaxChars: 24_000,
  };

  it('extends default plan with adaptive policy version', () => {
    const policy = new AdaptiveRetrievalPolicy('1');
    const plan = policy.resolve({ limit: 10, context: { maxChars: 12_000 } }, 5, deployment);

    expect(plan.policyVersion).toBe('adaptive-1');
    expect(plan.stagesApplied).toContain('summary');
  });

  it('raises caps when hints show high engagement and importance', () => {
    const policy = new AdaptiveRetrievalPolicy('1');
    const base = policy.resolve({ limit: 4, context: { maxChars: 2_000 } }, 6, deployment);
    const adapted = policy.resolve({ limit: 4, context: { maxChars: 2_000 } }, 6, deployment, {
      avgAccessCount: 5,
      avgImportance: 80,
      topImportance: 95,
    });

    expect(adapted.budget.maxMemories).toBeGreaterThanOrEqual(base.budget.maxMemories);
    expect(adapted.budget.maxChars).toBeGreaterThan(base.budget.maxChars);
  });
});
