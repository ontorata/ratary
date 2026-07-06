import { describe, expect, it } from 'vitest';
import {
  buildBearerOnlyUnauthorizedHeaders,
  buildMcpOAuthMetadataContext,
} from './mcp-oauth-metadata.js';

describe('buildBearerOnlyUnauthorizedHeaders', () => {
  it('does not advertise OAuth resource_metadata (API-key via server-card)', () => {
    const headers = buildBearerOnlyUnauthorizedHeaders();
    expect(headers['WWW-Authenticate']).toContain('Bearer realm="ratary"');
    expect(headers['WWW-Authenticate']).not.toContain('resource_metadata');
    expect(headers['WWW-Authenticate']).toContain('server-card.json');
  });
});

describe('buildMcpOAuthMetadataContext', () => {
  it('returns null when OAuth is disabled', () => {
    expect(
      buildMcpOAuthMetadataContext({
        REMOTE_MCP_OAUTH_ENABLED: false,
        OIDC_ISSUER_URL: 'https://auth.example.com',
        REMOTE_MCP_PUBLIC_URL: 'https://ratary.ontorata.com/mcp',
        REMOTE_MCP_PATH: '/mcp',
      } as Parameters<typeof buildMcpOAuthMetadataContext>[0]),
    ).toBeNull();
  });
});
