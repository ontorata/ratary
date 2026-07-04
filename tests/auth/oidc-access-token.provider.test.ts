import { describe, it, expect, vi } from 'vitest';
import { OidcAccessTokenProvider } from '../../src/auth/providers/oidc-access-token.provider.js';
import type { Env } from '../../src/config/env.js';

const ownerId = '00000000-0000-4000-8000-000000000099';
const issuer = 'https://auth.example.com/realms/ai-brain';

function oauthEnv(): Env {
  return {
    REMOTE_MCP_OAUTH_ENABLED: true,
    OIDC_ISSUER_URL: issuer,
    OIDC_MCP_OWNER_ID: ownerId,
  } as Env;
}

function fakeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.sig`;
}

describe('OidcAccessTokenProvider', () => {
  it('maps validated OIDC access token to configured owner', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ sub: 'user-123', email: 'dev@example.com' }),
    })) as unknown as typeof fetch;

    const provider = new OidcAccessTokenProvider({ env: oauthEnv(), fetchImpl });
    const token = fakeJwt({ iss: issuer, sub: 'user-123' });

    const resolved = await provider.authenticate({
      headers: { authorization: `Bearer ${token}` },
    });

    expect(resolved?.ownerId).toBe(ownerId);
    expect(resolved?.identityId).toBe('oidc:user-123');
    expect(fetchImpl).toHaveBeenCalledWith(`${issuer}/userinfo`, expect.any(Object));
  });

  it('returns null for non-OIDC issuer JWT', async () => {
    const provider = new OidcAccessTokenProvider({ env: oauthEnv() });
    const token = fakeJwt({ iss: 'https://other.example.com', sub: 'x' });
    const resolved = await provider.authenticate({
      headers: { authorization: `Bearer ${token}` },
    });
    expect(resolved).toBeNull();
  });
});
