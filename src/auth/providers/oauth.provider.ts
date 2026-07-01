import type { AuthContext, ResolvedIdentity } from '../auth.types.js';
import type { IdentityProvider } from './identity-provider.js';

export class OAuthProvider implements IdentityProvider {
  readonly name = 'oauth';

  async authenticate(_ctx: AuthContext): Promise<ResolvedIdentity | null> {
    return null;
  }
}
