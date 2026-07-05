import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resetEnvCache } from '../../src/config/env.js';
import {
  getRateLimitRedisClient,
  resetRateLimitRedisClientForTests,
  resolveRateLimitRedisUrl,
} from '../../src/plugins/rate-limit-redis.js';

describe('resolveRateLimitRedisUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetEnvCache();
    resetRateLimitRedisClientForTests();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetEnvCache();
    resetRateLimitRedisClientForTests();
  });

  it('should prefer RATE_LIMIT_REDIS_URL over REDIS_URL', () => {
    process.env.NODE_ENV = 'test';
    process.env.AUTH_SECRET = 'test-auth-secret-minimum-32-characters!!';
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acc';
    process.env.D1_DATABASE_ID = 'db';
    process.env.D1_API_TOKEN = 'token';
    process.env.RATE_LIMIT_REDIS_URL = 'redis://localhost:6379/0';
    process.env.REDIS_URL = 'redis://localhost:6380/0';

    expect(resolveRateLimitRedisUrl()).toBe('redis://localhost:6379/0');
  });

  it('should fall back to REDIS_URL when RATE_LIMIT_REDIS_URL is unset', () => {
    process.env.NODE_ENV = 'test';
    process.env.AUTH_SECRET = 'test-auth-secret-minimum-32-characters!!';
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acc';
    process.env.D1_DATABASE_ID = 'db';
    process.env.D1_API_TOKEN = 'token';
    delete process.env.RATE_LIMIT_REDIS_URL;
    process.env.REDIS_URL = 'redis://localhost:6380/0';

    expect(resolveRateLimitRedisUrl()).toBe('redis://localhost:6380/0');
  });

  it('should return undefined when no Redis URL is configured', () => {
    process.env.NODE_ENV = 'test';
    process.env.AUTH_SECRET = 'test-auth-secret-minimum-32-characters!!';
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acc';
    process.env.D1_DATABASE_ID = 'db';
    process.env.D1_API_TOKEN = 'token';
    delete process.env.RATE_LIMIT_REDIS_URL;
    delete process.env.REDIS_URL;

    expect(resolveRateLimitRedisUrl()).toBeUndefined();
    expect(getRateLimitRedisClient()).toBeUndefined();
  });

  it('should reuse a single Redis client instance', () => {
    process.env.NODE_ENV = 'test';
    process.env.AUTH_SECRET = 'test-auth-secret-minimum-32-characters!!';
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acc';
    process.env.D1_DATABASE_ID = 'db';
    process.env.D1_API_TOKEN = 'token';
    process.env.RATE_LIMIT_REDIS_URL = 'redis://localhost:6379/0';

    const first = getRateLimitRedisClient();
    const second = getRateLimitRedisClient();

    expect(first).toBeDefined();
    expect(second).toBe(first);
  });
});
