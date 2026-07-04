/**
 * Effective memory boundary for CRUD, search, and retrieval.
 * @see .ai/adr/002-workspace-identity-model.md
 * @see .ai/adr/007-multi-ai-workspace-scope.md
 */
export interface MemoryScope {
  /** Identity anchor — required in all phases. */
  ownerId: string;
  /** Shared brain pool — Phase 9+. */
  workspaceId?: string;
  /** Non-human actor attribution — Phase 9+. */
  agentId?: string;
  /** Retrieval/list filter hint (not a security boundary). */
  projectId?: string;
  /** Enterprise tenant — Phase 10+. */
  organizationId?: string;
  /** Enterprise department — Phase 17+. */
  departmentId?: string;
  /** Enterprise project (security boundary) — Phase 17+. */
  tenantProjectId?: string;
}

/** True when workspace-scoped queries should apply (post-migration). */
export function hasWorkspaceScope(
  scope: MemoryScope,
): scope is MemoryScope & { workspaceId: string } {
  return typeof scope.workspaceId === 'string' && scope.workspaceId.length > 0;
}

export function assertMcpOwnerConfigured(): void {
  if (process.env.NODE_ENV === 'production' && !process.env.MCP_OWNER_ID?.trim()) {
    throw new Error('MCP_OWNER_ID is required when NODE_ENV=production');
  }
}

/** @deprecated Use resolveMcpMemoryScope with DefaultScopeResolver at composition root. */
export function getMcpMemoryScope(): MemoryScope {
  assertMcpOwnerConfigured();

  const scope: MemoryScope = { ownerId: process.env.MCP_OWNER_ID ?? '' };

  const workspaceId = process.env.MCP_WORKSPACE_ID?.trim();
  if (workspaceId) {
    scope.workspaceId = workspaceId;
  }

  const agentId = process.env.MCP_AGENT_ID?.trim();
  if (agentId) {
    scope.agentId = agentId;
  }

  return scope;
}
