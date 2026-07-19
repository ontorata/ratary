import { describe, expect, it } from 'vitest';
import {
  combineSignals,
  DEFAULT_DECAY_WEIGHTS,
  parseDecayWeights,
  type DecaySignals,
} from '../../src/memory/decay/index.js';

function signals(overrides: Partial<DecaySignals> = {}): DecaySignals {
  return {
    relevance: 0.5,
    recency: 0.5,
    reactivation: 0.5,
    connectivity: 0.5,
    importance: 0.5,
    governanceProtection: 0,
    ...overrides,
  };
}

describe('parseDecayWeights', () => {
  it('parses the default CSV', () => {
    expect(
      parseDecayWeights('relevance:1,recency:1,reactivation:1,connectivity:1,importance:1'),
    ).toEqual(DEFAULT_DECAY_WEIGHTS);
  });

  it('allows partial overrides on top of defaults', () => {
    const weights = parseDecayWeights('connectivity:2');
    expect(weights.connectivity).toBe(2);
    expect(weights.relevance).toBe(1);
  });

  it('rejects unknown signals', () => {
    expect(() => parseDecayWeights('velocity:1')).toThrow(/unknown signal/);
  });

  it('rejects negative or non-numeric weights', () => {
    expect(() => parseDecayWeights('relevance:-1')).toThrow(/invalid weight/);
    expect(() => parseDecayWeights('relevance:abc')).toThrow(/invalid weight/);
  });
});

describe('combineSignals', () => {
  it('uniform signals return the same value (geometric mean)', () => {
    expect(combineSignals(signals(), DEFAULT_DECAY_WEIGHTS)).toBeCloseTo(0.5, 5);
  });

  it('is multiplicative: one weak axis drags the whole score down', () => {
    const strong = combineSignals(signals(), DEFAULT_DECAY_WEIGHTS);
    const orphaned = combineSignals(signals({ connectivity: 0.01 }), DEFAULT_DECAY_WEIGHTS);
    expect(orphaned).toBeLessThan(strong / 2);
  });

  it('a hub that is never recalled still decays', () => {
    const hubNeverRecalled = combineSignals(
      signals({ connectivity: 1, reactivation: 0.01, recency: 0.01 }),
      DEFAULT_DECAY_WEIGHTS,
    );
    expect(hubNeverRecalled).toBeLessThan(0.25);
  });

  it('protected memory always scores 1', () => {
    const score = combineSignals(
      signals({ relevance: 0.01, governanceProtection: 1 }),
      DEFAULT_DECAY_WEIGHTS,
    );
    expect(score).toBe(1);
  });

  it('weight 0 excludes a signal from the combination', () => {
    const weights = parseDecayWeights('connectivity:0');
    const withOrphan = combineSignals(signals({ connectivity: 0.01 }), weights);
    const withHub = combineSignals(signals({ connectivity: 1 }), weights);
    expect(withOrphan).toBeCloseTo(withHub, 10);
  });

  it('stays within [0, 1]', () => {
    const max = combineSignals(
      signals({ relevance: 1, recency: 1, reactivation: 1, connectivity: 1, importance: 1 }),
      DEFAULT_DECAY_WEIGHTS,
    );
    expect(max).toBeLessThanOrEqual(1);
    expect(max).toBeCloseTo(1, 5);
  });
});
