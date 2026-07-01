import { z } from 'zod';

export const IDENTITY_TYPES = [
  'api_key',
  'jwt',
  'oauth',
  'service_account',
  'mcp_token',
] as const;

export type IdentityType = (typeof IDENTITY_TYPES)[number];

export const DEFAULT_PERMISSIONS = ['memory.read', 'memory.write'] as const;

export const identityMetadataSchema = z
  .object({
    permissions: z.array(z.string()).default([...DEFAULT_PERMISSIONS]),
  })
  .passthrough();

export type IdentityMetadata = z.infer<typeof identityMetadataSchema>;

export interface IdentityRow {
  id: string;
  type: string;
  name: string;
  secret_hash: string | null;
  owner_id: string;
  description: string;
  metadata: string;
  client_id: string | null;
  created_by: string | null;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  active: number;
}

export interface Identity {
  id: string;
  type: IdentityType;
  name: string;
  ownerId: string;
  description: string;
  metadata: IdentityMetadata;
  clientId: string | null;
  createdBy: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  active: boolean;
}

export interface ClientRow {
  id: string;
  name: string;
  type: string;
  description: string;
  metadata: string;
  owner_id: string;
  created_at: string;
  active: number;
}

export interface Client {
  id: string;
  name: string;
  type: string;
  description: string;
  metadata: Record<string, unknown>;
  ownerId: string;
  createdAt: string;
  active: boolean;
}

export interface AuditLogRow {
  id: string;
  event: string;
  identity_id: string | null;
  owner_id: string | null;
  client_id: string | null;
  resource: string | null;
  resource_id: string | null;
  request_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: string;
  created_at: string;
}

export interface AuthUser {
  ownerId: string;
  identityId: string;
  identityType: IdentityType;
  clientId: string | null;
}

export interface AuthContext {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

export interface ResolvedIdentity {
  identityId: string;
  ownerId: string;
  type: IdentityType;
  clientId: string | null;
  metadata: IdentityMetadata;
}

export const bootstrapBodySchema = z.object({
  name: z.string().min(1).max(200).default('bootstrap'),
  owner_id: z.string().uuid().optional(),
  description: z.string().max(2000).default(''),
  client: z
    .object({
      name: z.string().min(1).max(200),
      type: z.string().min(1).max(100).default('unknown'),
      description: z.string().max(2000).default(''),
    })
    .optional(),
});

export const createIdentityBodySchema = z.object({
  type: z.enum(['api_key', 'service_account']).default('api_key'),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  owner_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  expires_at: z.string().datetime().optional().nullable(),
  metadata: identityMetadataSchema.optional(),
});

export type BootstrapBody = z.infer<typeof bootstrapBodySchema>;
export type CreateIdentityBody = z.infer<typeof createIdentityBodySchema>;

export const createClientBodySchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  description: z.string().max(2000).default(''),
  metadata: z.record(z.unknown()).optional(),
});

export const updateClientBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  metadata: z.record(z.unknown()).optional(),
  active: z.boolean().optional(),
});

export type CreateClientBody = z.infer<typeof createClientBodySchema>;
export type UpdateClientBody = z.infer<typeof updateClientBodySchema>;
