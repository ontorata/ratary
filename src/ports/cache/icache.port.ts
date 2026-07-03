/**
 * Vendor-neutral cache port.
 * Adapters: Redis, Dragonfly, Valkey, in-memory.
 * @see docs/adr/008-platform-architecture.md
 */
export interface CacheEntryOptions {
  ttlSeconds?: number;
}

export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheEntryOptions): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}
