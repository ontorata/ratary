import type { Env } from '../../../config/env.js';

export interface McpOAuthMetadataContext {
  resourceUrl: string;
  metadataUrl: string;
  issuerUrl: string;
}

export function buildMcpOAuthMetadataContext(
  env: Env,
  requestOrigin?: string,
): McpOAuthMetadataContext | null {
  if (!env.REMOTE_MCP_OAUTH_ENABLED || !env.OIDC_ISSUER_URL) {
    return null;
  }

  const baseUrl = resolvePublicBaseUrl(env, requestOrigin);
  if (!baseUrl) return null;

  const resourcePath = env.REMOTE_MCP_PATH.startsWith('/')
    ? env.REMOTE_MCP_PATH
    : `/${env.REMOTE_MCP_PATH}`;
  const resourceUrl = `${baseUrl}${resourcePath}`;
  const suffix = resourcePath.replace(/^\//, '');
  const metadataUrl =
    suffix.length > 0
      ? `${baseUrl}/.well-known/oauth-protected-resource/${suffix}`
      : `${baseUrl}/.well-known/oauth-protected-resource`;

  return {
    resourceUrl,
    metadataUrl,
    issuerUrl: env.OIDC_ISSUER_URL.replace(/\/$/, ''),
  };
}

export function buildProtectedResourceMetadata(
  ctx: McpOAuthMetadataContext,
): Record<string, unknown> {
  return {
    resource: ctx.resourceUrl,
    authorization_servers: [ctx.issuerUrl],
    bearer_methods_supported: ['header'],
    scopes_supported: ['openid', 'profile', 'email', 'mcp:tools'],
  };
}

export function buildMcpUnauthorizedHeaders(ctx: McpOAuthMetadataContext): Record<string, string> {
  const metadataParam = `resource_metadata="${ctx.metadataUrl}"`;
  return {
    'WWW-Authenticate': `Bearer error="invalid_token", error_description="Authentication required", ${metadataParam}`,
  };
}

export function buildBearerOnlyProtectedResourceMetadata(
  env: Env,
  requestOrigin?: string,
): Record<string, unknown> | null {
  if (env.REMOTE_MCP_OAUTH_ENABLED) return null;

  const baseUrl = resolvePublicBaseUrl(env, requestOrigin);
  if (!baseUrl) return null;

  const resourcePath = env.REMOTE_MCP_PATH.startsWith('/')
    ? env.REMOTE_MCP_PATH
    : `/${env.REMOTE_MCP_PATH}`;

  // RFC 9728 PRM for API-key servers: no authorization_servers (not OAuth).
  // Smithery setup probes this endpoint (must be HTTP 200). Glama must not follow
  // OAuth discovery — 401 responses omit resource_metadata (see buildBearerOnlyUnauthorizedHeaders).
  return {
    resource: `${baseUrl}${resourcePath}`,
    bearer_methods_supported: ['header', 'query'],
    resource_documentation: `${baseUrl}/.well-known/mcp/server-card.json`,
  };
}

export function buildBearerOnlyUnauthorizedHeaders(): Record<string, string> {
  // Do not advertise resource_metadata — strict OAuth clients (Glama, ChatGPT) would
  // fetch PRM and fail when authorization_servers is absent. API-key auth is in server-card.
  return {
    'WWW-Authenticate':
      'Bearer realm="ratary", error="invalid_token", error_description="API key required — see /.well-known/mcp/server-card.json"',
  };
}

function resolvePublicBaseUrl(env: Env, requestOrigin?: string): string | null {
  if (env.REMOTE_MCP_PUBLIC_URL) {
    try {
      const parsed = new URL(env.REMOTE_MCP_PUBLIC_URL);
      return parsed.origin;
    } catch {
      return null;
    }
  }
  if (requestOrigin?.startsWith('http://') || requestOrigin?.startsWith('https://')) {
    try {
      return new URL(requestOrigin).origin;
    } catch {
      return null;
    }
  }
  if (env.FEDERATION_NODE_BASE_URL) {
    try {
      return new URL(env.FEDERATION_NODE_BASE_URL).origin;
    } catch {
      return null;
    }
  }
  return null;
}
