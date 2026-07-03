import { Redis } from 'ioredis';
import type { Env } from '../../config/env.js';
import type { ICache } from '../../ports/cache/icache.port.js';
import { MemoryCache } from '../cache/memory-cache.adapter.js';
import { NoOpCache } from '../cache/noop-cache.adapter.js';
import { RedisCacheAdapter } from '../cache/redis/redis-cache.adapter.js';
import type { RedisStringClient } from '../cache/redis/redis-string-client.interface.js';

export function createCache(env: Env): ICache {
  if (env.CACHE_PROVIDER === 'redis') {
    if (!env.REDIS_URL) {
      throw new Error('REDIS_URL is required when CACHE_PROVIDER=redis');
    }
    const client = new Redis(env.REDIS_URL, { lazyConnect: true });
    return new RedisCacheAdapter(wrapIoRedisStringClient(client), {
      keyPrefix: env.REDIS_KEY_PREFIX,
    });
  }

  if (env.CACHE_PROVIDER === 'memory') {
    return new MemoryCache();
  }

  if (env.CACHE_PROVIDER !== 'none') {
    throw new Error(`CACHE_PROVIDER=${env.CACHE_PROVIDER} is not implemented`);
  }

  return new NoOpCache();
}

function wrapIoRedisStringClient(client: Redis): RedisStringClient {
  return {
    get: (key) => client.get(key),
    set: (key, value, mode, ttlSeconds) => {
      if (mode === 'EX' && ttlSeconds !== undefined) {
        return client.set(key, value, 'EX', ttlSeconds);
      }
      return client.set(key, value);
    },
    del: (key) => client.del(key),
    exists: (key) => client.exists(key),
  };
}
