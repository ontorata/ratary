import type { CacheEntryOptions, ICache } from '../../../ports/cache/icache.port.js';
import type { RedisStringClient } from './redis-string-client.interface.js';

export interface RedisCacheConfig {
  keyPrefix: string;
}

/**
 * Redis / Valkey cache adapter implementing ICache (ADR-012).
 * Values are JSON-serialized; keys are prefixed for multi-tenant isolation.
 */
export class RedisCacheAdapter implements ICache {
  constructor(
    private readonly client: RedisStringClient,
    private readonly config: RedisCacheConfig,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(this.prefixed(key));
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as T;
  }

  async set<T>(key: string, value: T, options?: CacheEntryOptions): Promise<void> {
    const serialized = JSON.stringify(value);
    const redisKey = this.prefixed(key);
    if (options?.ttlSeconds !== undefined) {
      await this.client.set(redisKey, serialized, 'EX', options.ttlSeconds);
      return;
    }
    await this.client.set(redisKey, serialized);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(this.prefixed(key));
  }

  async has(key: string): Promise<boolean> {
    const count = await this.client.exists(this.prefixed(key));
    return count > 0;
  }

  private prefixed(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }
}
