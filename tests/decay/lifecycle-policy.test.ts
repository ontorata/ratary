import { describe, expect, it } from 'vitest';
import {
  isWithinRetentionWindow,
  nextLifecycleState,
  type LifecycleContext,
} from '../../src/memory/decay/index.js';

const NOW = new Date('2026-07-19T00:00:00.000Z');
const CONFIG = { archiveFloor: 0.05, retentionDays: 90 };

function ctx(overrides: Partial<LifecycleContext> = {}): LifecycleContext {
  return {
    isProtected: false,
    relationDegree: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    lastAccessed: null,
    now: NOW,
    ...overrides,
  };
}

describe('isWithinRetentionWindow', () => {
  it('recently created memory is inside the window', () => {
    expect(isWithinRetentionWindow('2026-07-01T00:00:00.000Z', null, 90, NOW)).toBe(true);
  });

  it('old memory with recent access is inside the window', () => {
    expect(
      isWithinRetentionWindow('2025-01-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z', 90, NOW),
    ).toBe(true);
  });

  it('old never-accessed memory is outside the window', () => {
    expect(isWithinRetentionWindow('2025-01-01T00:00:00.000Z', null, 90, NOW)).toBe(false);
  });
});

describe('nextLifecycleState', () => {
  it('high score stays active', () => {
    expect(nextLifecycleState(0.8, CONFIG, ctx())).toBe('active');
  });

  it('score bands map to dormant and fading', () => {
    expect(nextLifecycleState(0.2, CONFIG, ctx())).toBe('dormant');
    expect(nextLifecycleState(0.1, CONFIG, ctx())).toBe('fading');
  });

  it('reactivation promotes: a higher recomputed score returns to active', () => {
    expect(nextLifecycleState(0.5, CONFIG, ctx())).toBe('active');
  });

  it('protected memory is always active regardless of score', () => {
    expect(nextLifecycleState(0, CONFIG, ctx({ isProtected: true }))).toBe('active');
  });

  it('archives only when ALL gate conditions hold', () => {
    expect(nextLifecycleState(0.01, CONFIG, ctx())).toBe('archived');
  });

  it('does not archive a memory with relations', () => {
    expect(nextLifecycleState(0.01, CONFIG, ctx({ relationDegree: 2 }))).toBe('fading');
  });

  it('retention window is a grace period: recent memory stays active even with low score', () => {
    expect(
      nextLifecycleState(0.01, CONFIG, ctx({ createdAt: '2026-07-10T00:00:00.000Z' })),
    ).toBe('active');
    expect(
      nextLifecycleState(0.01, CONFIG, ctx({ lastAccessed: '2026-07-10T00:00:00.000Z' })),
    ).toBe('active');
  });

  it('does not archive a protected memory even below the floor', () => {
    expect(nextLifecycleState(0.01, CONFIG, ctx({ isProtected: true }))).toBe('active');
  });

  it('old unprotected orphan handoff below the floor is archived', () => {
    // Tag semantics live in protection-policy; here handoff = unprotected input.
    expect(
      nextLifecycleState(0.01, CONFIG, ctx({ createdAt: '2025-06-01T00:00:00.000Z' })),
    ).toBe('archived');
  });
});
