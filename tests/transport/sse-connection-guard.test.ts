import { describe, it, expect } from 'vitest';
import { SseConnectionGuard } from '../../src/transport/sse/sse-connection-guard.js';

describe('SseConnectionGuard', () => {
  it('allows up to maxConcurrentPerKey active streams per client key', () => {
    const guard = new SseConnectionGuard(2);

    expect(guard.tryAcquire('10.0.0.1')).toBe(true);
    expect(guard.tryAcquire('10.0.0.1')).toBe(true);
    expect(guard.tryAcquire('10.0.0.1')).toBe(false);
    expect(guard.activeCount('10.0.0.1')).toBe(2);
  });

  it('tracks keys independently', () => {
    const guard = new SseConnectionGuard(1);

    expect(guard.tryAcquire('a')).toBe(true);
    expect(guard.tryAcquire('b')).toBe(true);
    expect(guard.tryAcquire('a')).toBe(false);
  });

  it('releases slots on close', () => {
    const guard = new SseConnectionGuard(1);

    expect(guard.tryAcquire('client')).toBe(true);
    expect(guard.tryAcquire('client')).toBe(false);

    guard.release('client');

    expect(guard.activeCount('client')).toBe(0);
    expect(guard.tryAcquire('client')).toBe(true);
  });

  it('ignores release when no active slot', () => {
    const guard = new SseConnectionGuard(3);
    guard.release('missing');
    expect(guard.activeCount('missing')).toBe(0);
  });
});
