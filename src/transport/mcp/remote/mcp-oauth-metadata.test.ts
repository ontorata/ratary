import { describe, expect, it } from 'vitest';
import { buildBearerOnlyProtectedResourceMetadata } from './mcp-oauth-metadata.js';

describe('buildBearerOnlyProtectedResourceMetadata', () => {
  const env = {
    REMOTE_MCP_OAUTH_ENABLED: false,
    REMOTE_MCP_PUBLIC_URL: 'https://ratary.ontorata.com/mcp',
    REMOTE_MCP_PATH: '/mcp',
  } as Parameters<typeof buildBearerOnlyProtectedResourceMetadata>[0];

  it('returns bearer-only metadata without OAuth authorization servers', () => {
    const meta = buildBearerOnlyProtectedResourceMetadata(env);
    expect(meta).toMatchObject({
      resource: 'https://ratary.ontorata.com/mcp',
      bearer_methods_supported: ['header', 'query'],
      authorization_servers: [],
    });
  });

  it('returns null when OAuth mode is enabled', () => {
    expect(
      buildBearerOnlyProtectedResourceMetadata({ ...env, REMOTE_MCP_OAUTH_ENABLED: true }),
    ).toBeNull();
  });
});
