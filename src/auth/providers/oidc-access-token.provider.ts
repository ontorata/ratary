import type { Env } from '../../config/env.js';
import type { AuthContext, ResolvedIdentity } from '../auth.types.js';
import { UnauthorizedError } from '../../types/errors.js';
import type { IdentityProvider } from './identity-provider.js';
import {
  extractOidcAccessToken,
  fetchOidcUserInfo,
  issuerMatches,
  type OidcUserInfo,
} from './oidc-token-utils.js';

export interface OidcAccessTokenProviderOptions {
  env: Env;
  fetchImpl?: typeof fetch;
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
    if (!env.REMOTE_MCP_OAUTH_ENABLED || !env.OIDC_ISSUER_URL || env.STUDIO_OIDC_ENABLED) {
      return null;
    }

    const token = extractOidcAccessToken(ctx);
    if (!token) return null;

    const issuer = env.OIDC_ISSUER_URL.replace(/\/$/, '');
    if (!issuerMatches(token, issuer)) {
      return null;
    }

    const userInfo = await this.fetchUserInfo(issuer, token);
    const ownerId = env.OIDC_MCP_OWNER_ID;
    if (!ownerId) {
      throw new UnauthorizedError('OIDC_MCP_OWNER_ID is required for MCP OAuth token mapping');
    }

    const subject = userInfo.sub;
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
    try {
      return await fetchOidcUserInfo(issuer, accessToken, this.fetchImpl);
    } catch {
      throw new UnauthorizedError('OIDC userinfo failed');
    }
  }
}
