import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { getRateLimitRedisClient, rateLimitRedisOptions } from './rate-limit-redis.js';

/** Rate limits for sensitive auth routes (per IP). */
export const AUTH_RATE_LIMITS = {
  bootstrap: { max: 5, timeWindow: '1 hour' },
  identities: { max: 20, timeWindow: '1 minute' },
  rotate: { max: 10, timeWindow: '1 minute' },
} as const;

export async function registerAuthRateLimit(fastify: FastifyInstance): Promise<void> {
  const redis = getRateLimitRedisClient();

  await fastify.register(rateLimit, {
    global: false,
    hook: 'onRequest',
    keyGenerator: (request) => request.ip,
    ...(redis ? { redis, ...rateLimitRedisOptions } : {}),
  });
}
