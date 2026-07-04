import type { Env } from '../../config/env.js';
import type { AuthContext, ResolvedIdentity } from '../auth.types.js';
import { isApiKeyFormat, isOAuthTokenFormat } from '../crypto.js';
import { UnauthorizedError } from '../../types/errors.js';
import { extractBearerToken, isJwtFormat } from '../token-utils.js';
import type { IdentityProvider } from './identity-provider.js';

export interface OidcAccessTokenProviderOptions {
  env: Env;
  fetchImpl?: typeof fetch;
}

interface OidcUserInfo {
  sub?: string;
  email?: string;
  name?: string;
}

/** Validates OIDC access tokens for remote MCP OAuth (Phase 13.1D / Phase 17 bridge). */
export class OidcAccessTokenProvider implements IdentityProvider {
  readonly name = 'oidc-access-token';
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: OidcAccessTokenProviderOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async authenticate(ctx: AuthContext): Promise<ResolvedIdentity | null> {
    const env = this.options.env;
    if (!env.REMOTE_MCP_OAUTH_ENABLED || !env.OIDC_ISSUER_URL) {
      return null;
    }

    const token = extractBearerToken(ctx);
    if (!token || isApiKeyFormat(token) || isOAuthTokenFormat(token) || !isJwtFormat(token)) {
      return null;
    }

    const issuer = env.OIDC_ISSUER_URL.replace(/\/$/, '');
    const payload = decodeJwtPayload(token);
    const tokenIssuer = typeof payload.iss === 'string' ? payload.iss.replace(/\/$/, '') : '';
    if (tokenIssuer && tokenIssuer !== issuer) {
      return null;
    }

    const userInfo = await this.fetchUserInfo(issuer, token);
    const ownerId = env.OIDC_MCP_OWNER_ID;
    if (!ownerId) {
      throw new UnauthorizedError('OIDC_MCP_OWNER_ID is required for MCP OAuth token mapping');
    }

    const subject = userInfo.sub ?? tokenIssuer;
    if (!subject) {
      throw new UnauthorizedError('OIDC token missing subject');
    }

    return {
      identityId: `oidc:${subject}`,
      ownerId,
      type: 'oauth',
      clientId: null,
      metadata: {
        permissions: ['memory.read', 'memory.write'],
        externalSubject: subject,
        email: userInfo.email,
        displayName: userInfo.name,
      },
    };
  }

  private async fetchUserInfo(issuer: string, accessToken: string): Promise<OidcUserInfo> {
    const userInfoUrl = `${issuer}/userinfo`;
    const response = await this.fetchImpl(userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new UnauthorizedError(`OIDC userinfo failed: HTTP ${response.status}`);
    }

    return (await response.json()) as OidcUserInfo;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length < 2) return {};
  try {
    return JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    return {};
  }
}
