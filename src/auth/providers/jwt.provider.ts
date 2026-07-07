import type { IdentityRepository } from '../identity.repository.js';
import type { AuthContext, ResolvedIdentity } from '../auth.types.js';
import type { JwtService } from '../jwt.service.js';
import { isApiKeyFormat, isOAuthTokenFormat } from '../crypto.js';
import { ForbiddenError, UnauthorizedError } from '../../types/errors.js';
import { extractBearerToken } from '../token-utils.js';
import { resolveBearerJwt } from '../token-crypto.js';
import type { IdentityProvider } from './identity-provider.js';

export class JwtProvider implements IdentityProvider {
  readonly name = 'jwt';

  constructor(
    private readonly jwtService: JwtService,
    private readonly identityRepository: IdentityRepository,
  ) {}

  async authenticate(ctx: AuthContext): Promise<ResolvedIdentity | null> {
    const raw = extractBearerToken(ctx);
    if (!raw || isApiKeyFormat(raw) || isOAuthTokenFormat(raw)) {
      return null;
    }

    let jwtToken: string;
    try {
      const resolved = resolveBearerJwt(raw);
      if (!resolved) return null;
      jwtToken = resolved;
    } catch {
      throw new UnauthorizedError('Invalid bearer token');
    }

    const claims = this.jwtService.verify(jwtToken);
    const identity = await this.identityRepository.findById(claims.sub);
    if (!identity) {
      throw new UnauthorizedError('Invalid JWT');
    }

    if (!identity.active) {
      throw new ForbiddenError('Identity has been revoked');
    }

    if (identity.expiresAt && new Date(identity.expiresAt) < new Date()) {
      throw new ForbiddenError('Identity has expired');
    }

    if (identity.ownerId !== claims.owner_id) {
      throw new UnauthorizedError('Invalid JWT');
    }

    return {
      identityId: identity.id,
      ownerId: identity.ownerId,
      type: identity.type,
      clientId: identity.clientId,
      metadata: identity.metadata,
    };
  }
}
