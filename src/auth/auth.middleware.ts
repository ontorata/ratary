import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthService } from './auth.service.js';
import type { AuthUser } from './auth.types.js';

const PUBLIC_PATHS = new Set(['/health', '/docs', '/docs/json', '/docs/yaml', '/docs/static']);

function isPublicPath(url: string): boolean {
  const path = url.split('?')[0] ?? url;
  if (PUBLIC_PATHS.has(path)) return true;
  if (path.startsWith('/docs/')) return true;
  if (path === '/api/v1/auth/bootstrap') return true;
  if (path === '/api/v1/health' || path === '/health') return true;
  if (path === '/') return true;
  return false;
}

export function createAuthenticateMiddleware(authService: AuthService) {
  return async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    if (isPublicPath(request.url)) return;

    const user = await authService.authenticate({
      headers: request.headers,
      ip: request.ip,
      userAgent:
        typeof request.headers['user-agent'] === 'string'
          ? request.headers['user-agent']
          : undefined,
      requestId: request.id,
    });

    request.user = user;
  };
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}
