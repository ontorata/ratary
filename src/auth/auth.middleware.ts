import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthService } from './auth.service.js';
import type { AuthUser } from './auth.types.js';
import { getEnv } from '../config/index.js';
import { extractBearerToken } from './token-utils.js';
import { MCP_SERVER_CARD_PATH } from '../transport/mcp/remote/mcp-server-card.js';

function mcpPathFromEnv(): string | null {
  const env = getEnv();
  if (!env.REMOTE_MCP_ENABLED) return null;
  return env.REMOTE_MCP_PATH.startsWith('/')
    ? env.REMOTE_MCP_PATH
    : `/${env.REMOTE_MCP_PATH}`;
}

function pathOnly(url: string): string {
  return url.split('?')[0] ?? url;
}

/** Smithery gateway may pass apiKey as query — promote to Bearer for auth providers. */
function injectMcpQueryApiKey(request: FastifyRequest): void {
  const mcpPath = mcpPathFromEnv();
  if (!mcpPath || pathOnly(request.url) !== mcpPath) return;
  if (extractBearerToken({ headers: request.headers })) return;

  try {
    const parsed = new URL(request.url, 'http://localhost');
    const apiKey = parsed.searchParams.get('apiKey') ?? parsed.searchParams.get('api_key');
    if (apiKey) {
      request.headers.authorization = `Bearer ${apiKey}`;
    }
  } catch {
    // ignore malformed URL
  }
}

function isRemoteMcpPath(url: string): boolean {
  const mcpPath = mcpPathFromEnv();
  if (!mcpPath) return false;
  return pathOnly(url) === mcpPath;
}

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
  if (path === MCP_SERVER_CARD_PATH) return true;
  if (path === '/') return true;
  return false;
}

export function createAuthenticateMiddleware(authService: AuthService) {
  return async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    if (isPublicPath(request.url)) return;

    injectMcpQueryApiKey(request);

    if (isRemoteMcpPath(request.url)) {
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
