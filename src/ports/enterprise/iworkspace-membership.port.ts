/** Workspace-scoped permissions enforced at the composition/auth boundary (ADR-002). */
export type WorkspacePermission = 'memory.read' | 'memory.write' | 'memory.admin';

export interface IWorkspaceMembership {
  assertAccess(
    identityId: string,
    workspaceId: string,
    permission: WorkspacePermission,
  ): Promise<void>;
}
