import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { getEnv } from '../config/index.js';
import { MCP_SERVER_CARD_PATH } from '../transport/mcp/remote/mcp-server-card.js';
import { resolveAuthorizedTenantContext } from './authorization-boundary.js';

function pathOnly(url: string): string {
  return url.split('?')[0] ?? url;
}

function mcpPathFromEnv(): string | null {
  const env = getEnv();
  if (!env.REMOTE_MCP_ENABLED) return null;
  return env.REMOTE_MCP_PATH.startsWith('/') ? env.REMOTE_MCP_PATH : `/${env.REMOTE_MCP_PATH}`;
}

function isRemoteMcpPath(url: string): boolean {
  const mcpPath = mcpPathFromEnv();
  if (!mcpPath) return false;
  return pathOnly(url) === mcpPath;
}

const PUBLIC_PATHS = new Set(['/health', '/docs', '/docs/json', '/docs/yaml', '/docs/static']);

function isPublicPath(url: string): boolean {
  const path = pathOnly(url);
  if (PUBLIC_PATHS.has(path)) return true;
  if (path.startsWith('/docs/')) return true;
  if (path === '/api/v1/auth/bootstrap') return true;
  if (path === '/api/v1/auth/register') return true;
  if (path === '/api/v1/auth/login') return true;
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

/**
 * Routes that may authenticate without explicit tenant headers (bootstrap / management).
 * Data-plane routes require X-Organization-Id + X-Workspace-Id — no silent default tenant.
 */
export function isTenantContextExemptPath(url: string, method: string): boolean {
  if (isPublicPath(url)) return true;
  if (isRemoteMcpPath(url)) return true;

  const path = pathOnly(url);
  if (path.startsWith('/api/v1/auth/')) return true;
  if (path === '/api/v1/workspaces' && (method === 'GET' || method === 'POST')) return true;

  return false;
}

export function createTenantContextMiddleware(db: ISqlDatabase) {
  return async function resolveTenantContextMiddleware(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    if (isTenantContextExemptPath(request.url, request.method)) return;

    const user = request.user;
    if (!user?.ownerId) return;

    const tenant = await resolveAuthorizedTenantContext(db, user, request.headers, 'REST');
    request.user = tenant;
  };
}
