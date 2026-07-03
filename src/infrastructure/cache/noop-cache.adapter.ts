import type { CacheEntryOptions, ICache } from '../../ports/cache/icache.port.js';

export class NoOpCache implements ICache {
  async get<T>(_key: string): Promise<T | null> {
    return null;
  }

  async set<T>(_key: string, _value: T, _options?: CacheEntryOptions): Promise<void> {}

  async delete(_key: string): Promise<void> {}

  async has(_key: string): Promise<boolean> {
    return false;
  }
}
