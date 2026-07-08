import type { IdentityRepository } from './identity.repository.js';
import type { AuthContext, AuthUser, ResolvedIdentity } from './auth.types.js';
import { emitAuthEvent } from './events.js';
import { UnauthorizedError } from '../types/errors.js';
import type { IdentityProvider } from './providers/identity-provider.js';
import { resolveApiKey } from './providers/api-key.provider.js';

export class AuthService {
  constructor(
    private readonly providers: IdentityProvider[],
    private readonly identityRepository: IdentityRepository,
  ) {}

  async authenticate(ctx: AuthContext): Promise<AuthUser> {
    for (const provider of this.providers) {
      try {
        const resolved = await provider.authenticate(ctx);
        if (!resolved) continue;

        await this.identityRepository.updateLastUsed(resolved.identityId);

        emitAuthEvent({
          event: 'identity.used',
          identityId: resolved.identityId,
          ownerId: resolved.ownerId,
          clientId: resolved.clientId,
          context: ctx,
        });

        return toAuthUser(resolved);
      } catch (error) {
        if (error instanceof UnauthorizedError || isForbidden(error)) {
          emitAuthEvent({
            event: 'auth.failed',
            context: ctx,
            metadata: { reason: error instanceof Error ? error.message : 'unknown' },
          });
          throw error;
        }
        // provider couldn't handle — try next
      }
    }

    emitAuthEvent({
      event: 'auth.failed',
      context: ctx,
      metadata: { reason: 'no_valid_credentials' },
    });

    throw new UnauthorizedError('Invalid or missing credentials');
  }

  async verify(ctx: AuthContext): Promise<AuthUser> {
    return this.authenticate(ctx);
  }

  async verifyPlaintextApiKey(plaintext: string): Promise<AuthUser> {
    const resolved = await resolveApiKey(this.identityRepository, plaintext);
    return toAuthUser(resolved);
  }
}

function toAuthUser(resolved: ResolvedIdentity): AuthUser {
  return {
    ownerId: resolved.ownerId,
    identityId: resolved.identityId,
    id: resolved.identityId,
    identityType: resolved.type,
    clientId: resolved.clientId,
    permissions: resolved.metadata.permissions ?? [],
  };
}

function isForbidden(error: unknown): boolean {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    (error as { statusCode: number }).statusCode === 403
  );
}
