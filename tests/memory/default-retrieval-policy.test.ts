import { describe, it, expect } from 'vitest';
import { DefaultRetrievalPolicy } from '../../src/memory/retrieval-policy/default-retrieval-policy.js';

describe('DefaultRetrievalPolicy', () => {
  const policy = new DefaultRetrievalPolicy();
  const deployment = {
    hybridRetrieval: false,
    graphRetrieval: false,
    maxContextMaxChars: 24_000,
  };

  it('defaults to summary-only stages without body hydration', () => {
    const plan = policy.resolve({ context: { includeSummaryOnly: true } }, 5, deployment);

    expect(plan.hydrateBody).toBe(false);
    expect(plan.stagesApplied).toEqual(['metadata', 'summary']);
    expect(plan.budget.allowBodyHydration).toBe(false);
  });

  it('hydrates body when includeSummaryOnly is false', () => {
    const plan = policy.resolve({ context: { includeSummaryOnly: false } }, 5, deployment);

    expect(plan.hydrateBody).toBe(true);
    expect(plan.stagesApplied).toContain('body');
  });

  it('includes vector and graph stages when deployment flags are on', () => {
    const plan = policy.resolve({}, 3, {
      hybridRetrieval: true,
      graphRetrieval: true,
      maxContextMaxChars: 24_000,
    });

    expect(plan.stagesApplied).toContain('vector');
    expect(plan.stagesApplied).toContain('graph');
  });
});
