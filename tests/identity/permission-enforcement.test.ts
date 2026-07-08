import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { AuthUser } from '../../src/auth/auth.types.js';
import {
  PERMISSIONS,
  assertPermission,
  evaluatePermissionForRequest,
  resolvePermissionContext,
  resolveRequiredPermission,
} from '../../src/auth/permission-context.js';
import { ForbiddenError, TenantContextRequiredError } from '../../src/types/errors.js';

function authWith(
  permissions: string[],
  tenant?: { organizationId: string; workspaceId: string },
): AuthUser {
  const identityId = randomUUID();
  return {
    ownerId: randomUUID(),
    identityId,
    id: identityId,
    identityType: 'api_key',
    clientId: null,
    permissions,
    organizationId: tenant?.organizationId,
    workspaceId: tenant?.workspaceId,
  };
}

describe('permission enforcement (identity foundation wave 3)', () => {
  it('defines canonical permission action strings', () => {
    expect(PERMISSIONS.MEMORY_READ).toBe('memory.read');
    expect(PERMISSIONS.MEMORY_WRITE).toBe('memory.write');
    expect(PERMISSIONS.WORKSPACE_READ).toBe('workspace.read');
    expect(PERMISSIONS.WORKSPACE_MANAGE).toBe('workspace.manage');
    expect(PERMISSIONS.ORGANIZATION_MANAGE).toBe('organization.manage');
  });

  it('maps data-plane routes to memory permissions', () => {
    expect(resolveRequiredPermission('GET', '/api/v1/memory')).toBe(PERMISSIONS.MEMORY_READ);
    expect(resolveRequiredPermission('GET', '/api/v1/search?q=test')).toBe(PERMISSIONS.MEMORY_READ);
    expect(resolveRequiredPermission('POST', '/api/v1/memory')).toBe(PERMISSIONS.MEMORY_WRITE);
    expect(resolveRequiredPermission('POST', '/api/v1/knowledge-fabric/ingest/github')).toBe(
      PERMISSIONS.MEMORY_WRITE,
    );
  });

  it('allows user with memory.read to read memory routes', () => {
    const tenant = { organizationId: randomUUID(), workspaceId: randomUUID() };
    const auth = authWith(['memory.read'], tenant);

    expect(() =>
      evaluatePermissionForRequest(auth, 'GET', '/api/v1/memory/abc'),
    ).not.toThrow();
  });

  it('denies user without memory.read with 403 Forbidden', () => {
    const tenant = { organizationId: randomUUID(), workspaceId: randomUUID() };
    const auth = authWith(['memory.write'], tenant);

    expect(() => evaluatePermissionForRequest(auth, 'GET', '/api/v1/search')).toThrow(
      ForbiddenError,
    );
  });

  it('allows user with memory.write to write memory routes', () => {
    const tenant = { organizationId: randomUUID(), workspaceId: randomUUID() };
    const auth = authWith(['memory.write', 'memory.read'], tenant);

    expect(() => evaluatePermissionForRequest(auth, 'POST', '/api/v1/memory')).not.toThrow();
  });

  it('requires tenant context before permission evaluation on data-plane routes', () => {
    const auth = authWith(['memory.read']);

    expect(() => evaluatePermissionForRequest(auth, 'GET', '/api/v1/memory')).toThrow(
      TenantContextRequiredError,
    );
  });

  it('leaves bootstrap auth routes unaffected', () => {
    const auth = authWith([]);
    expect(evaluatePermissionForRequest(auth, 'POST', '/api/v1/auth/register')).toBeNull();
  });

  it('builds tenant-scoped PermissionContext', () => {
    const tenant = { organizationId: randomUUID(), workspaceId: randomUUID() };
    const auth = authWith(['memory.read', 'memory.write'], tenant);
    const ctx = resolvePermissionContext(auth);

    expect(ctx.identityId).toBe(auth.identityId);
    expect(ctx.organizationId).toBe(tenant.organizationId);
    expect(ctx.workspaceId).toBe(tenant.workspaceId);
    expect(ctx.permissions).toContain('memory.read');

    expect(() => assertPermission(ctx, PERMISSIONS.MEMORY_READ)).not.toThrow();
    expect(() => assertPermission(ctx, PERMISSIONS.MEMORY_WRITE)).not.toThrow();
  });
});
