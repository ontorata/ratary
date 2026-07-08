import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { AuthUser } from './auth.types.js';
import { findOrganizationById } from '../scope/organization-store.js';
import { findWorkspaceById } from '../scope/workspace-store.js';
import { ForbiddenError, NotFoundError, TenantContextRequiredError } from '../types/errors.js';

export interface TenantContext {
  organizationId: string;
  workspaceId: string;
}

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const raw = headers[name];
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (Array.isArray(raw) && raw.length > 0) {
    const trimmed = raw[0]?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

/**
 * Resolves and validates tenant context from transport headers.
 * Production data-plane requests must supply explicit organization + workspace scope.
 */
export async function resolveTenantContext(
  db: ISqlDatabase,
  auth: AuthUser,
  headers: Record<string, string | string[] | undefined>,
): Promise<TenantContext> {
  const organizationId = headerValue(headers, 'x-organization-id');
  const workspaceId = headerValue(headers, 'x-workspace-id');

  if (!organizationId) {
    throw new TenantContextRequiredError('X-Organization-Id header is required');
  }
  if (!workspaceId) {
    throw new TenantContextRequiredError('X-Workspace-Id header is required');
  }

  const organization = await findOrganizationById(db, auth.ownerId, organizationId);
  if (!organization) {
    throw new NotFoundError('Organization', organizationId);
  }

  const workspace = await findWorkspaceById(db, auth.ownerId, workspaceId, { organizationId });
  if (!workspace) {
    throw new NotFoundError('Workspace', workspaceId);
  }

  return { organizationId, workspaceId };
}

export function attachTenantContextToAuthUser(
  auth: AuthUser,
  tenant: TenantContext,
): AuthUser {
  return {
    ...auth,
    organizationId: tenant.organizationId,
    workspaceId: tenant.workspaceId,
  };
}

export function assertScopeHintsMatchAuthTenant(
  auth: AuthUser,
  hints?: { organizationId?: string; workspaceId?: string },
): void {
  if (hints?.organizationId && auth.organizationId && hints.organizationId !== auth.organizationId) {
    throw new ForbiddenError('Organization hint does not match authenticated tenant context');
  }
  if (hints?.workspaceId && auth.workspaceId && hints.workspaceId !== auth.workspaceId) {
    throw new ForbiddenError('Workspace hint does not match authenticated tenant context');
  }
}
