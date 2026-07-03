import { describe, expect, it } from 'vitest';
import { RedisCacheAdapter } from '../../src/infrastructure/cache/redis/redis-cache.adapter.js';
import type { RedisStringClient } from '../../src/infrastructure/cache/redis/redis-string-client.interface.js';
import { describeCacheContract } from './contracts/icache.contract.js';

class InMemoryRedisStringClient implements RedisStringClient {
  private readonly store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, mode?: 'EX', ttlSeconds?: number): Promise<'OK' | null> {
    const expiresAt =
      mode === 'EX' && ttlSeconds !== undefined ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    const value = await this.get(key);
    return value === null ? 0 : 1;
  }
}

describe('RedisCacheAdapter', () => {
  describeCacheContract('redis in-memory client', () => {
    return new RedisCacheAdapter(new InMemoryRedisStringClient(), {
      keyPrefix: 'test:',
    });
  });

  it('should prefix keys', async () => {
    const client = new InMemoryRedisStringClient();
    const cache = new RedisCacheAdapter(client, { keyPrefix: 'prefix:' });
    await cache.set('owner-a:mem', 'value');
    expect(await client.get('prefix:owner-a:mem')).toBe('"value"');
  });
});
