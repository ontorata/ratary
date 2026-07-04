import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthService } from './auth.service.js';
import type { AuthUser } from './auth.types.js';
import { getEnv } from '../config/index.js';
import { extractBearerToken } from './token-utils.js';

const PUBLIC_PATHS = new Set(['/health', '/docs', '/docs/json', '/docs/yaml', '/docs/static']);

function isPublicPath(url: string): boolean {
  const path = url.split('?')[0] ?? url;
  if (PUBLIC_PATHS.has(path)) return true;
  if (path.startsWith('/docs/')) return true;
  if (path === '/api/v1/auth/bootstrap') return true;
  if (path === '/api/v1/capabilities' || path === '/api/v1/capabilities/negotiate') return true;
  if (path.startsWith('/api/v1/ecosystem/')) return true;
  if (path.startsWith('/api/v1/infrastructure/marketplace')) return true;
  if (path.startsWith('/api/v1/auth/sso/')) return true;
  if (path === '/metrics' || path.startsWith('/metrics?')) return true;
  if (path === '/api/v1/health' || path === '/health') return true;
  if (path.startsWith('/.well-known/oauth-protected-resource')) return true;
  if (path === '/') return true;
  return false;
}

function shouldDeferMcpOAuthAuth(url: string): boolean {
  const env = getEnv();
  if (!env.REMOTE_MCP_OAUTH_ENABLED || !env.REMOTE_MCP_ENABLED) return false;
  const path = url.split('?')[0] ?? url;
  const mcpPath = env.REMOTE_MCP_PATH.startsWith('/') ? env.REMOTE_MCP_PATH : `/${env.REMOTE_MCP_PATH}`;
  return path === mcpPath;
}

export function createAuthenticateMiddleware(authService: AuthService) {
  return async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    if (isPublicPath(request.url)) return;

    if (shouldDeferMcpOAuthAuth(request.url)) {
      const token = extractBearerToken({ headers: request.headers });
      if (!token) return;
    }

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
