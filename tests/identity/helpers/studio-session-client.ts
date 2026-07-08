/** Mirrors Ontorata-Studio session → data-plane header propagation (Wave 5). */

export interface StudioSessionContext {
  accessToken: string;
  identityId: string;
  ownerId: string;
  organizationId: string;
  workspaceId: string;
}

export function toStudioSessionContext(data: {
  accessToken: string;
  identityId: string;
  ownerId: string;
  organizationId: string;
  workspaceId: string;
}): StudioSessionContext {
  return {
    accessToken: data.accessToken,
    identityId: data.identityId,
    ownerId: data.ownerId,
    organizationId: data.organizationId,
    workspaceId: data.workspaceId,
  };
}

export function buildStudioDataPlaneHeaders(
  session: StudioSessionContext,
): Record<string, string> {
  return {
    Authorization: `Bearer ${session.accessToken}`,
    'X-Organization-Id': session.organizationId,
    'X-Workspace-Id': session.workspaceId,
  };
}

export function resolveStudioTenantFromSession(
  session: StudioSessionContext,
  routeWorkspaceId?: string,
): Pick<StudioSessionContext, 'identityId' | 'organizationId' | 'workspaceId'> {
  return {
    identityId: session.identityId,
    organizationId: session.organizationId,
    workspaceId: routeWorkspaceId ?? session.workspaceId,
  };
}
