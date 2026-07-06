import type { Env } from '../../config/env.js';
import type { IdentityRepository } from '../identity.repository.js';
import type { AuthContext, ResolvedIdentity } from '../auth.types.js';
import { generateId } from '../../utils/memory-mapper.js';
import { UnauthorizedError } from '../../types/errors.js';
import type { IdentityProvider } from './identity-provider.js';
import {
  extractOidcAccessToken,
  fetchOidcUserInfo,
  issuerMatches,
  studioOidcIdentityName,
} from './oidc-token-utils.js';

export interface StudioOidcAccessTokenProviderOptions {
  env: Env;
  identityRepository: IdentityRepository;
  fetchImpl?: typeof fetch;
}

/** Phase 2 — per-user Studio SSO via external OIDC access tokens (e.g. Zitadel). */
export class StudioOidcAccessTokenProvider implements IdentityProvider {
  readonly name = 'studio-oidc-access-token';
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: StudioOidcAccessTokenProviderOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async authenticate(ctx: AuthContext): Promise<ResolvedIdentity | null> {
    const env = this.options.env;
    if (!env.STUDIO_OIDC_ENABLED || !env.OIDC_ISSUER_URL) {
      return null;
    }

    const token = extractOidcAccessToken(ctx);
    if (!token) return null;

    const issuer = env.OIDC_ISSUER_URL.replace(/\/$/, '');
    if (!issuerMatches(token, issuer)) {
      return null;
    }

    const userInfo = await this.fetchUserInfo(issuer, token);
    const subject = userInfo.sub;
    if (!subject) {
      throw new UnauthorizedError('OIDC token missing subject');
    }

    const identityName = studioOidcIdentityName(subject);
    const existing = await this.options.identityRepository.findByName(identityName);
    if (existing) {
      return {
        identityId: existing.id,
        ownerId: existing.ownerId,
        type: 'oauth',
        clientId: existing.clientId,
        metadata: existing.metadata,
      };
    }

    const ownerId = generateId();
    const created = await this.options.identityRepository.insert({
      type: 'oauth',
      name: identityName,
      secretHash: null,
      ownerId,
      description: 'Studio OIDC auto-provisioned identity',
      metadata: {
        permissions: ['memory.read', 'memory.write'],
        externalSubject: subject,
        email: userInfo.email,
        displayName: userInfo.name,
        idp: 'oidc',
        issuer,
      },
    });

    return {
      identityId: created.id,
      ownerId: created.ownerId,
      type: 'oauth',
      clientId: created.clientId,
      metadata: created.metadata,
    };
  }

  private async fetchUserInfo(issuer: string, accessToken: string) {
    try {
      return await fetchOidcUserInfo(issuer, accessToken, this.fetchImpl);
    } catch {
      throw new UnauthorizedError('OIDC userinfo failed');
    }
  }
}
