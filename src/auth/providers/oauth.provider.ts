import type { IdentityRepository } from '../identity.repository.js';
import type { AuthContext, ResolvedIdentity } from '../auth.types.js';
import { hashSecret, isOAuthTokenFormat } from '../crypto.js';
import { ForbiddenError, UnauthorizedError } from '../../types/errors.js';
import { extractBearerToken } from '../token-utils.js';
import type { IdentityProvider } from './identity-provider.js';

export class OAuthProvider implements IdentityProvider {
  readonly name = 'oauth';

  constructor(private readonly identityRepository: IdentityRepository) {}

  async authenticate(ctx: AuthContext): Promise<ResolvedIdentity | null> {
    const token = extractBearerToken(ctx);
    if (!token || !isOAuthTokenFormat(token)) return null;

    return resolveOAuthToken(this.identityRepository, token);
  }
}

export async function resolveOAuthToken(
  repository: IdentityRepository,
  plaintext: string,
): Promise<ResolvedIdentity> {
  if (!isOAuthTokenFormat(plaintext)) {
    throw new UnauthorizedError('Invalid OAuth token format');
  }

  const hash = hashSecret(plaintext);
  const identity = await repository.findBySecretHash(hash);
  if (!identity) {
    throw new UnauthorizedError('Invalid OAuth token');
  }

  if (!identity.active) {
    throw new ForbiddenError('OAuth token has been revoked');
  }

  if (identity.expiresAt && new Date(identity.expiresAt) < new Date()) {
    throw new ForbiddenError('OAuth token has expired');
  }

  return {
    identityId: identity.id,
    ownerId: identity.ownerId,
    type: identity.type,
    clientId: identity.clientId,
    metadata: identity.metadata,
  };
}
