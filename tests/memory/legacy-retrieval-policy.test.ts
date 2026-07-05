import { describe, it, expect } from 'vitest';
import { LegacyRetrievalPolicy } from '../../src/memory/retrieval-policy/legacy-retrieval-policy.js';

describe('LegacyRetrievalPolicy', () => {
  const policy = new LegacyRetrievalPolicy();
  const deployment = {
    hybridRetrieval: true,
    graphRetrieval: true,
    maxContextMaxChars: 24_000,
  };

  it('skips progressive caps and relation/graph stages', () => {
    const plan = policy.resolve({ limit: 10, context: { maxChars: 1_500 } }, 8, deployment);

    expect(plan.policyVersion).toBe('legacy');
    expect(plan.stagesApplied).toEqual(['summary']);
    expect(plan.budget.maxMemories).toBe(10);
    expect(plan.budget.allowGraphExpansion).toBe(false);
    expect(plan.stagesApplied).not.toContain('relations');
  });

  it('hydrates body when summary-only is disabled', () => {
    const plan = policy.resolve({ context: { includeSummaryOnly: false } }, 2, deployment);
    expect(plan.hydrateBody).toBe(true);
    expect(plan.stagesApplied).toContain('body');
  });
});
