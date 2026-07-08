import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { AuthUser } from './auth.types.js';
import {
  type Permission,
  type PermissionContext,
  assertPermission,
  evaluatePermissionForRequest,
  resolvePermissionContext,
  resolveRequiredPermission,
} from './permission-context.js';
import { attachTenantContextToAuthUser, resolveTenantContext } from './tenant-context.js';
import { AppError, ForbiddenError } from '../types/errors.js';

/** Transport label for authorization audit — not a permission namespace. */
export type AuthorizationTransport = 'REST' | 'MCP';

export interface AuthorizationAuditRecord {
  transport: AuthorizationTransport;
  identityId: string;
  organizationId: string;
  workspaceId: string;
  permission: Permission | null;
  decision: 'allow' | 'deny';
  reason?: string;
}

type AuthorizationAuditSink = (record: AuthorizationAuditRecord) => void;

let authorizationAuditSink: AuthorizationAuditSink = () => {};

/** Test hook — records authorization decisions for parity and compliance evidence. */
export function setAuthorizationAuditSink(sink: AuthorizationAuditSink): void {
  authorizationAuditSink = sink;
}

export function resetAuthorizationAuditSink(): void {
  authorizationAuditSink = () => {};
}

function recordAuthorizationAudit(record: AuthorizationAuditRecord): void {
  authorizationAuditSink(record);
}

function auditFieldsFromAuth(
  auth: AuthUser,
): Pick<AuthorizationAuditRecord, 'identityId' | 'organizationId' | 'workspaceId'> {
  return {
    identityId: auth.identityId,
    organizationId: auth.organizationId ?? '',
    workspaceId: auth.workspaceId ?? '',
  };
}

/**
 * Resolves tenant context and attaches it to AuthUser.
 * Shared by REST middleware and MCP remote HTTP boundary.
 */
export async function resolveAuthorizedTenantContext(
  db: ISqlDatabase,
  auth: AuthUser,
  headers: Record<string, string | string[] | undefined>,
  transport: AuthorizationTransport,
): Promise<AuthUser> {
  try {
    const tenant = await resolveTenantContext(db, auth, headers);
    const enriched = attachTenantContextToAuthUser(auth, tenant);
    recordAuthorizationAudit({
      transport,
      ...auditFieldsFromAuth(enriched),
      permission: null,
      decision: 'allow',
      reason: 'tenant_resolved',
    });
    return enriched;
  } catch (error) {
    recordAuthorizationAudit({
      transport,
      ...auditFieldsFromAuth(auth),
      permission: null,
      decision: 'deny',
      reason: error instanceof AppError ? error.code : 'tenant_denied',
    });
    throw error;
  }
}

/** MCP remote session entry — tenant required before tool dispatch. */
export async function authorizeMcpRemoteSession(
  db: ISqlDatabase,
  auth: AuthUser,
  headers: Record<string, string | string[] | undefined>,
): Promise<AuthUser> {
  return resolveAuthorizedTenantContext(db, auth, headers, 'MCP');
}

/**
 * REST permission evaluation with audit trail.
 * Delegates to Wave 3 permission contract — no transport-specific permissions.
 */
export function evaluateRestAuthorization(
  auth: AuthUser,
  method: string,
  url: string,
): PermissionContext | null {
  const required = resolveRequiredPermission(method, url);

  try {
    const ctx = evaluatePermissionForRequest(auth, method, url);
    if (required && ctx) {
      recordAuthorizationAudit({
        transport: 'REST',
        identityId: ctx.identityId,
        organizationId: ctx.organizationId,
        workspaceId: ctx.workspaceId,
        permission: required,
        decision: 'allow',
      });
    }
    return ctx;
  } catch (error) {
    const partial = auditFieldsFromAuth(auth);
    recordAuthorizationAudit({
      transport: 'REST',
      ...partial,
      permission: required,
      decision: 'deny',
      reason: error instanceof ForbiddenError ? 'permission_denied' : 'authorization_denied',
    });
    throw error;
  }
}

/** MCP handler permission check — same PermissionContext as REST data-plane. */
export function assertMcpRemoteHandlerPermission(
  auth: AuthUser,
  required: Permission,
): PermissionContext {
  try {
    const ctx = resolvePermissionContext(auth);
    assertPermission(ctx, required);
    recordAuthorizationAudit({
      transport: 'MCP',
      identityId: ctx.identityId,
      organizationId: ctx.organizationId,
      workspaceId: ctx.workspaceId,
      permission: required,
      decision: 'allow',
    });
    return ctx;
  } catch (error) {
    const partial = auditFieldsFromAuth(auth);
    recordAuthorizationAudit({
      transport: 'MCP',
      ...partial,
      permission: required,
      decision: 'deny',
      reason: error instanceof ForbiddenError ? 'permission_denied' : 'authorization_denied',
    });
    throw error;
  }
}

export interface McpAuthorizationErrorBody {
  code: string;
  reason: string;
}

export function formatMcpAuthorizationError(error: unknown): {
  status: number;
  body: McpAuthorizationErrorBody;
} {
  if (error instanceof ForbiddenError) {
    return {
      status: 403,
      body: { code: 'FORBIDDEN', reason: 'permission_denied' },
    };
  }

  if (error instanceof AppError) {
    if (error.code === 'TENANT_CONTEXT_REQUIRED') {
      return {
        status: error.statusCode,
        body: { code: error.code, reason: 'tenant_context_required' },
      };
    }
    if (error.code === 'NOT_FOUND') {
      return {
        status: 404,
        body: { code: 'NOT_FOUND', reason: 'not_found' },
      };
    }
    return {
      status: error.statusCode,
      body: { code: error.code, reason: 'authorization_denied' },
    };
  }

  return {
    status: 500,
    body: { code: 'INTERNAL_ERROR', reason: 'authorization_denied' },
  };
}
