import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getEnv } from '../config/index.js';
import { UnauthorizedError } from '../types/errors.js';

const PUBLIC_PATHS = new Set(['/health', '/docs', '/docs/json', '/docs/yaml', '/docs/static']);

export async function authPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', async (request: FastifyRequest, _reply: FastifyReply) => {
    const env = getEnv();

    if (!env.API_KEY) return;

    const path = request.url.split('?')[0];
    if (PUBLIC_PATHS.has(path) || path.startsWith('/docs/')) return;

    const authHeader = request.headers.authorization;
    const apiKeyHeader = request.headers['x-api-key'];

    const providedKey =
      (typeof apiKeyHeader === 'string' ? apiKeyHeader : undefined) ??
      (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);

    if (providedKey !== env.API_KEY) {
      throw new UnauthorizedError('Invalid or missing API key');
    }
  });
}
