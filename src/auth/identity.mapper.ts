import type { Identity, IdentityMetadata, IdentityRow } from './auth.types.js';
import { identityMetadataSchema } from './auth.types.js';

export function rowToIdentity(row: IdentityRow): Identity {
  let metadata: IdentityMetadata = { permissions: ['memory.read', 'memory.write'] };
  try {
    metadata = identityMetadataSchema.parse(JSON.parse(row.metadata || '{}'));
  } catch {
    // keep default
  }

  return {
    id: row.id,
    type: row.type as Identity['type'],
    name: row.name,
    ownerId: row.owner_id,
    description: row.description,
    metadata,
    clientId: row.client_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    active: row.active === 1,
  };
}

export function metadataToJson(metadata: IdentityMetadata): string {
  return JSON.stringify(metadata);
}
