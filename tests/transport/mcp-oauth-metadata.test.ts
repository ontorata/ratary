import { describe, it, expect } from 'vitest';
import {
  buildMcpOAuthMetadataContext,
  buildProtectedResourceMetadata,
  buildMcpUnauthorizedHeaders,
} from '../../src/transport/mcp/remote/mcp-oauth-metadata.js';
import type { Env } from '../../src/config/env.js';

function oauthEnv(overrides: Partial<Env> = {}): Env {
  return {
    REMOTE_MCP_OAUTH_ENABLED: true,
    REMOTE_MCP_ENABLED: true,
    REMOTE_MCP_PATH: '/mcp',
    REMOTE_MCP_PUBLIC_URL: 'https://memory.example.com/mcp',
    OIDC_ISSUER_URL: 'https://auth.example.com/realms/ai-brain',
    OIDC_MCP_OWNER_ID: '00000000-0000-4000-8000-000000000099',
  } as Env;
}

describe('MCP OAuth metadata (Phase 13.1D)', () => {
  it('builds RFC 9728 protected resource metadata', () => {
    const ctx = buildMcpOAuthMetadataContext(oauthEnv());
    expect(ctx).not.toBeNull();
    const metadata = buildProtectedResourceMetadata(ctx!);
    expect(metadata.resource).toBe('https://memory.example.com/mcp');
    expect(metadata.authorization_servers).toEqual(['https://auth.example.com/realms/ai-brain']);
  });

  it('builds WWW-Authenticate header with resource_metadata', () => {
    const ctx = buildMcpOAuthMetadataContext(oauthEnv())!;
    const headers = buildMcpUnauthorizedHeaders(ctx);
    expect(headers['WWW-Authenticate']).toContain('resource_metadata=');
    expect(headers['WWW-Authenticate']).toContain('/.well-known/oauth-protected-resource/mcp');
  });

  it('returns null when oauth disabled', () => {
    const env = oauthEnv();
    env.REMOTE_MCP_OAUTH_ENABLED = false;
    expect(buildMcpOAuthMetadataContext(env)).toBeNull();
  });
});
