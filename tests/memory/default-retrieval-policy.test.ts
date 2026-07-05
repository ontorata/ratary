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

  it('includes vector, graph, and relations stages when deployment flags are on', () => {
    const plan = policy.resolve({}, 3, {
      hybridRetrieval: true,
      graphRetrieval: true,
      maxContextMaxChars: 24_000,
    });

    expect(plan.stagesApplied).toContain('vector');
    expect(plan.stagesApplied).toContain('graph');
    expect(plan.stagesApplied).toContain('relations');
    expect(plan.budget.allowGraphExpansion).toBe(true);
  });

  it('reduces maxMemories under tight char budget', () => {
    const plan = policy.resolve({ limit: 10, context: { maxChars: 1_500 } }, 8, deployment);

    expect(plan.budget.maxChars).toBe(1_500);
    expect(plan.budget.maxMemories).toBeLessThan(10);
  });

  it('uses custom policy version when provided', () => {
    const custom = new DefaultRetrievalPolicy('2');
    const plan = custom.resolve({}, 1, deployment);
    expect(plan.policyVersion).toBe('2');
  });
});
