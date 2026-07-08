import { randomUUID } from 'node:crypto';
import type { AuthUser } from '../../src/auth/auth.types.js';

export function makeAuthUser(ownerId: string, permissions: string[]): AuthUser {
  const identityId = randomUUID();
  return {
    ownerId,
    identityId,
    id: identityId,
    identityType: 'api_key',
    clientId: null,
    permissions,
  };
}
