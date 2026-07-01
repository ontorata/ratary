import type { AuthContext, ResolvedIdentity } from '../auth.types.js';
import type { IdentityProvider } from './identity-provider.js';

export class JwtProvider implements IdentityProvider {
  readonly name = 'jwt';

  async authenticate(_ctx: AuthContext): Promise<ResolvedIdentity | null> {
    return null;
  }
}
