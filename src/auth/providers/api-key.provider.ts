import type { IdentityRepository } from '../identity.repository.js';
import type { AuthContext, ResolvedIdentity } from '../auth.types.js';
import { hashSecret, isApiKeyFormat } from '../crypto.js';
import { ForbiddenError, UnauthorizedError } from '../../types/errors.js';
import type { IdentityProvider } from './identity-provider.js';
import { extractBearerToken } from '../token-utils.js';

export class ApiKeyProvider implements IdentityProvider {
  readonly name = 'api_key';

  constructor(private readonly identityRepository: IdentityRepository) {}

  async authenticate(ctx: AuthContext): Promise<ResolvedIdentity | null> {
    const token = extractBearerToken(ctx);
    if (!token || !isApiKeyFormat(token)) return null;

    return resolveApiKey(this.identityRepository, token);
  }
}

export async function resolveApiKey(
  repository: IdentityRepository,
  plaintext: string,
): Promise<ResolvedIdentity> {
  if (!isApiKeyFormat(plaintext)) {
    throw new UnauthorizedError('Invalid API key format');
  }

  const hash = hashSecret(plaintext);
  const identity = await repository.findBySecretHash(hash);
  if (!identity) {
    throw new UnauthorizedError('Invalid API key');
  }

  if (!identity.active) {
    throw new ForbiddenError('API key has been revoked');
  }

  if (identity.expiresAt && new Date(identity.expiresAt) < new Date()) {
    throw new ForbiddenError('API key has expired');
  }

  return {
    identityId: identity.id,
    ownerId: identity.ownerId,
    type: identity.type,
    clientId: identity.clientId,
    metadata: identity.metadata,
  };
}
