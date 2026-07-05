import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createCache } from '../../src/infrastructure/composition/create-cache.js';
import { MemoryCache } from '../../src/infrastructure/cache/memory-cache.adapter.js';
import { NoOpCache } from '../../src/infrastructure/cache/noop-cache.adapter.js';
import { RedisCacheAdapter } from '../../src/infrastructure/cache/redis/redis-cache.adapter.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';

describe('createCache', () => {
  beforeEach(() => resetEnvCache());
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('should return NoOpCache by default', () => {
    vi.stubEnv('CACHE_PROVIDER', 'none');
    expect(createCache(getEnv())).toBeInstanceOf(NoOpCache);
  });

  it('should return MemoryCache when CACHE_PROVIDER=memory', () => {
    vi.stubEnv('CACHE_PROVIDER', 'memory');
    expect(createCache(getEnv())).toBeInstanceOf(MemoryCache);
  });

  it('should return RedisCacheAdapter when CACHE_PROVIDER=redis', () => {
    vi.stubEnv('CACHE_PROVIDER', 'redis');
    vi.stubEnv('REDIS_URL', 'redis://127.0.0.1:6379');
    expect(createCache(getEnv())).toBeInstanceOf(RedisCacheAdapter);
  });
});
