import type { FastifyReply, FastifyRequest } from 'fastify';
import { getEnv } from '../config/index.js';
import { ForbiddenError } from '../types/errors.js';

const CREDENTIAL_AUTH_PATHS = new Set(['/api/v1/auth/register', '/api/v1/auth/login']);

function pathOnly(url: string): string {
  return url.split('?')[0] ?? url;
}

/** Reject cleartext credential auth in production — passwords must travel over TLS only. */
export async function requireHttpsForCredentialAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const env = getEnv();
  if (env.NODE_ENV !== 'production') return;

  const path = pathOnly(request.url);
  if (!CREDENTIAL_AUTH_PATHS.has(path)) return;

  const forwarded = request.headers['x-forwarded-proto'];
  const proto = typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : undefined;
  if (proto && proto !== 'https') {
    throw new ForbiddenError('HTTPS is required for credential authentication');
  }
}
