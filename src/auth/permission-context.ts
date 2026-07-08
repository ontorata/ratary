import { getEnv } from '../config/index.js';
import type { AuthUser } from './auth.types.js';
import { ForbiddenError, TenantContextRequiredError } from '../types/errors.js';
import { isTenantContextExemptPath } from './tenant-context.middleware.js';

/** Canonical permission action strings — do not introduce aliases. */
export const PERMISSIONS = {
  MEMORY_READ: 'memory.read',
  MEMORY_WRITE: 'memory.write',
  WORKSPACE_READ: 'workspace.read',
  WORKSPACE_MANAGE: 'workspace.manage',
  ORGANIZATION_MANAGE: 'organization.manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: readonly Permission[] = Object.values(PERMISSIONS);

export function isPermission(value: string): value is Permission {
  return (ALL_PERMISSIONS as readonly string[]).includes(value);
}

export function hasPermission(granted: readonly string[], required: Permission): boolean {
  return granted.includes(required);
}

function pathOnly(url: string): string {
  return url.split('?')[0] ?? url;
}

function isPublicOrAuthPath(path: string): boolean {
  if (path === '/' || path === '/health' || path === '/api/v1/health') return true;
  if (path === '/api/v1/capabilities' || path === '/api/v1/capabilities/negotiate') return true;
  if (path.startsWith('/api/v1/ecosystem/')) return true;
  if (path.startsWith('/api/v1/infrastructure/marketplace')) return true;
  if (path.startsWith('/api/v1/auth/sso/')) return true;
  if (path === '/metrics' || path.startsWith('/metrics?')) return true;
  if (path.startsWith('/.well-known/oauth-protected-resource')) return true;
  if (path.startsWith('/docs')) return true;
  if (path.startsWith('/api/v1/auth/')) return true;
  const env = getEnv();
  const mcpPath = env.REMOTE_MCP_PATH.startsWith('/')
    ? env.REMOTE_MCP_PATH
    : `/${env.REMOTE_MCP_PATH}`;
  if (path === mcpPath) return true;
  return false;
}

function isMemoryReadPath(path: string): boolean {
  if (path === '/api/v1/search') return true;
  if (path.startsWith('/api/v1/memory')) return true;
  if (path === '/api/v1/projects' || path === '/api/v1/tags') return true;
  return false;
}

function isMemoryWritePath(path: string, method: string): boolean {
  if (path.startsWith('/api/v1/knowledge-fabric/ingest/') && method === 'POST') return true;
  if (path.startsWith('/api/v1/signals') && method === 'POST') return true;
  if (!path.startsWith('/api/v1/memory') && !path.startsWith('/api/v1/backup')) return false;
  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')
    return true;
  return false;
}

export function isDataPlanePath(url: string, method: string): boolean {
  const path = pathOnly(url);
  if (isPublicOrAuthPath(path)) return false;
  if (isTenantContextExemptPath(url, method)) return false;
  if (path === '/api/v1/context' && method === 'POST') return true;
  if (method === 'GET' || method === 'HEAD') return isMemoryReadPath(path);
  return isMemoryWritePath(path, method);
}

export function resolveRequiredPermission(method: string, url: string): Permission | null {
  const path = pathOnly(url);

  if (isPublicOrAuthPath(path)) {
    return null;
  }

  if (path === '/api/v1/workspaces' && method === 'GET') {
    return PERMISSIONS.WORKSPACE_READ;
  }
  if (path === '/api/v1/workspaces' && method === 'POST') {
    return PERMISSIONS.WORKSPACE_MANAGE;
  }

  if (path === '/api/v1/context' && method === 'POST') {
    return PERMISSIONS.MEMORY_READ;
  }

  if ((method === 'GET' || method === 'HEAD') && isMemoryReadPath(path)) {
    return PERMISSIONS.MEMORY_READ;
  }

  if (isMemoryWritePath(path, method)) {
    return PERMISSIONS.MEMORY_WRITE;
  }

  if (method === 'GET' || method === 'HEAD') {
    return PERMISSIONS.MEMORY_READ;
  }

  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    return PERMISSIONS.MEMORY_WRITE;
  }

  return null;
}

export interface PermissionContext {
  identityId: string;
  ownerId: string;
  organizationId: string;
  workspaceId: string;
  permissions: readonly string[];
}

/**
 * Builds tenant-scoped permission context. Permissions apply within organization + workspace,
 * not globally across all organizations for the owner.
 */
export function resolvePermissionContext(auth: AuthUser): PermissionContext {
  if (!auth.organizationId || !auth.workspaceId) {
    throw new TenantContextRequiredError('Tenant context is required before permission evaluation');
  }

  return {
    identityId: auth.identityId,
    ownerId: auth.ownerId,
    organizationId: auth.organizationId,
    workspaceId: auth.workspaceId,
    permissions: auth.permissions,
  };
}

export function assertPermission(ctx: PermissionContext, required: Permission): void {
  if (!hasPermission(ctx.permissions, required)) {
    throw new ForbiddenError(`Missing required permission: ${required}`);
  }
}

export function evaluatePermissionForRequest(
  auth: AuthUser,
  method: string,
  url: string,
): PermissionContext | null {
  const required = resolveRequiredPermission(method, url);
  if (!required) return null;

  const tenantRequired = !isTenantContextExemptPath(url, method);

  if (tenantRequired) {
    const ctx = resolvePermissionContext(auth);
    assertPermission(ctx, required);
    return ctx;
  }

  if (!hasPermission(auth.permissions, required)) {
    throw new ForbiddenError(`Missing required permission: ${required}`);
  }

  return null;
}
