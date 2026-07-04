import { Redis } from 'ioredis';
import { getEnv } from '../config/index.js';

const RATE_LIMIT_KEY_PREFIX = 'ai-brain:ratelimit:';

let sharedClient: Redis | undefined;

/** Resolves Redis URL for distributed auth rate limits (Upstash / Vercel KV compatible). */
export function resolveRateLimitRedisUrl(): string | undefined {
  const env = getEnv();
  return env.RATE_LIMIT_REDIS_URL ?? env.REDIS_URL;
}

/** Shared ioredis client for @fastify/rate-limit when a Redis URL is configured. */
export function getRateLimitRedisClient(): Redis | undefined {
  const url = resolveRateLimitRedisUrl();
  if (!url) {
    return undefined;
  }

  if (!sharedClient) {
    sharedClient = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
  }

  return sharedClient;
}

export function resetRateLimitRedisClientForTests(): void {
  sharedClient = undefined;
}

export const rateLimitRedisOptions = {
  nameSpace: RATE_LIMIT_KEY_PREFIX,
  skipOnError: true,
} as const;
