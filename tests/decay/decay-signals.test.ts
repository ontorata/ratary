import { describe, expect, it } from 'vitest';
import {
  computeDecaySignals,
  DEFAULT_SIGNAL_FLOOR,
  type DecaySignalInput,
} from '../../src/memory/decay/index.js';

const NOW = new Date('2026-07-19T00:00:00.000Z');
const CONFIG = { halfLifeDays: 30 };

function input(overrides: Partial<DecaySignalInput> = {}): DecaySignalInput {
  return {
    updatedAt: '2026-07-19T00:00:00.000Z',
    lastAccessed: null,
    accessCount: 0,
    relationDegree: 0,
    importance: 50,
    favorite: false,
    tags: [],
    ...overrides,
  };
}

describe('computeDecaySignals', () => {
  it('fresh memory has relevance 1', () => {
    const signals = computeDecaySignals(input(), CONFIG, NOW, false);
    expect(signals.relevance).toBeCloseTo(1, 5);
  });

  it('relevance halves after one half-life (30 days)', () => {
    const signals = computeDecaySignals(
      input({ updatedAt: '2026-06-19T00:00:00.000Z' }),
      CONFIG,
      NOW,
      false,
    );
    expect(signals.relevance).toBeCloseTo(0.5, 3);
  });

  it('relevance never drops below the floor', () => {
    const signals = computeDecaySignals(
      input({ updatedAt: '2020-01-01T00:00:00.000Z' }),
      CONFIG,
      NOW,
      false,
    );
    expect(signals.relevance).toBe(DEFAULT_SIGNAL_FLOOR);
  });

  it('never-accessed memory falls back to updatedAt for recency (store = first activity)', () => {
    const fresh = computeDecaySignals(input(), CONFIG, NOW, false);
    expect(fresh.recency).toBeCloseTo(1, 5);
    expect(fresh.reactivation).toBe(DEFAULT_SIGNAL_FLOOR);

    const old = computeDecaySignals(
      input({ updatedAt: '2025-01-01T00:00:00.000Z' }),
      CONFIG,
      NOW,
      false,
    );
    expect(old.recency).toBe(DEFAULT_SIGNAL_FLOOR);
  });

  it('recent frequent access raises reactivation', () => {
    const cold = computeDecaySignals(input(), CONFIG, NOW, false);
    const hot = computeDecaySignals(
      input({ accessCount: 20, lastAccessed: '2026-07-18T00:00:00.000Z' }),
      CONFIG,
      NOW,
      false,
    );
    expect(hot.reactivation).toBeGreaterThan(cold.reactivation);
    expect(hot.recency).toBeGreaterThan(0.9);
  });

  it('frequently recalled long ago decays in reactivation (recency weight)', () => {
    const recent = computeDecaySignals(
      input({ accessCount: 20, lastAccessed: '2026-07-18T00:00:00.000Z' }),
      CONFIG,
      NOW,
      false,
    );
    const stale = computeDecaySignals(
      input({ accessCount: 20, lastAccessed: '2026-01-01T00:00:00.000Z' }),
      CONFIG,
      NOW,
      false,
    );
    expect(stale.reactivation).toBeLessThan(recent.reactivation);
  });

  it('connectivity saturates to 1 at the saturation degree', () => {
    const orphan = computeDecaySignals(input(), CONFIG, NOW, false);
    const hub = computeDecaySignals(input({ relationDegree: 10 }), CONFIG, NOW, false);
    expect(orphan.connectivity).toBe(DEFAULT_SIGNAL_FLOOR);
    expect(hub.connectivity).toBeCloseTo(1, 5);
  });

  it('importance is normalized from 0-100 and clamped', () => {
    expect(computeDecaySignals(input({ importance: 80 }), CONFIG, NOW, false).importance).toBe(0.8);
    expect(computeDecaySignals(input({ importance: 100 }), CONFIG, NOW, false).importance).toBe(1);
  });

  it('marks governanceProtection from the caller decision', () => {
    expect(computeDecaySignals(input(), CONFIG, NOW, true).governanceProtection).toBe(1);
    expect(computeDecaySignals(input(), CONFIG, NOW, false).governanceProtection).toBe(0);
  });

  it('is deterministic for equal input and now', () => {
    const a = computeDecaySignals(input({ accessCount: 3 }), CONFIG, NOW, false);
    const b = computeDecaySignals(input({ accessCount: 3 }), CONFIG, NOW, false);
    expect(a).toEqual(b);
  });
});
