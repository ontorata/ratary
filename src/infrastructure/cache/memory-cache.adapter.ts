import type { CacheEntryOptions, ICache } from '../../ports/cache/icache.port.js';

interface CacheEntry {
  value: unknown;
  expiresAt?: number;
}

export class MemoryCache implements ICache {
  private readonly store = new Map<string, CacheEntry>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, options?: CacheEntryOptions): Promise<void> {
    const expiresAt =
      options?.ttlSeconds !== undefined ? Date.now() + options.ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }
}
