import { describe, it, expect } from 'vitest';
import type { ICache } from '../../../src/ports/cache/icache.port.js';

export function describeCacheContract(label: string, createCache: () => ICache): void {
  describe(`ICache contract — ${label}`, () => {
    it('should set and get values', async () => {
      const cache = createCache();
      await cache.set('key-a', { value: 1 });
      expect(await cache.get<{ value: number }>('key-a')).toEqual({ value: 1 });
    });

    it('should return null for missing keys', async () => {
      const cache = createCache();
      expect(await cache.get('missing')).toBeNull();
    });

    it('should delete stored values', async () => {
      const cache = createCache();
      await cache.set('temp', 'payload');
      await cache.delete('temp');
      expect(await cache.has('temp')).toBe(false);
    });

    it('should expire values when ttl elapses', async () => {
      const cache = createCache();
      await cache.set('short-lived', 'payload', { ttlSeconds: 1 });
      expect(await cache.has('short-lived')).toBe(true);
      await new Promise((resolve) => setTimeout(resolve, 1100));
      expect(await cache.get('short-lived')).toBeNull();
    });
  });
}
