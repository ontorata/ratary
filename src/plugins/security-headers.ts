import type { FastifyInstance } from 'fastify';
import { getEnv } from '../config/index.js';

/** Baseline headers against sniffing / clickjacking on Studio and API. */
export async function registerSecurityHeaders(fastify: FastifyInstance): Promise<void> {
  const env = getEnv();

  fastify.addHook('onSend', async (_request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Referrer-Policy', 'no-referrer');
    reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (env.NODE_ENV === 'production') {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
  });
}
