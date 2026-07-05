import { describe, it, expect } from 'vitest';
import { RuleBasedCompressionPolicy } from '../../src/memory/compression/rule-based-compression-policy.js';

describe('RuleBasedCompressionPolicy', () => {
  const policy = new RuleBasedCompressionPolicy();
  const ctx = {
    scope: { ownerId: 'owner-1' },
    deploymentLimits: { maxMemoryContentBytes: 1_048_576 },
  };

  it('compresses duplicate clusters of size >= 2', () => {
    const candidate = {
      memory: {
        id: 'a',
        title: 'T',
        content: 'body',
        summary: 's',
        level: 'note' as const,
        semanticHash: 'hash',
      },
      duplicateClusterSize: 2,
    };

    expect(policy.shouldCompress(candidate, ctx)).toBe(true);
    expect(policy.targetLevel(candidate)).toBe('summary');
  });

  it('targets canonical level for large duplicate clusters', () => {
    const candidate = {
      memory: {
        id: 'a',
        title: 'T',
        content: 'body',
        summary: 's',
        level: 'note' as const,
        semanticHash: 'hash',
      },
      duplicateClusterSize: 3,
    };

    expect(policy.targetLevel(candidate)).toBe('canonical');
  });
});
