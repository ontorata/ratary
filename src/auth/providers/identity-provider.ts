import type { AuthContext, ResolvedIdentity } from './auth.types.js';

export interface IdentityProvider {
  readonly name: string;
  authenticate(ctx: AuthContext): Promise<ResolvedIdentity | null>;
}
