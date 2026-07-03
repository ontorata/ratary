/** Owner + optional workspace boundary for repository queries (ADR-007). */
export interface OwnerWorkspaceScope {
  ownerId: string;
  workspaceId?: string;
}

export function appendWorkspaceFilter(
  conditions: string[],
  params: unknown[],
  workspaceId?: string,
  column = 'workspace_id',
): void {
  if (workspaceId) {
    conditions.push(`${column} = ?`);
    params.push(workspaceId);
  }
}

export function workspaceIdFromScope(scope: { workspaceId?: string }): string | undefined {
  const id = scope.workspaceId?.trim();
  return id || undefined;
}
