import type { AuthUser } from '../auth/auth.types.js';
import type { MemoryScope } from '../types/memory-scope.js';

/** MCP environment inputs for scope resolution — ADR-007 Appendix B. */
export interface McpScopeEnv {
  ownerId: string;
  workspaceId?: string;
  agentId?: string;
}

/** Optional hints from transport layer (REST header, query, body). */
export interface ScopeResolutionHints {
  workspaceId?: string;
  agentId?: string;
  projectId?: string;
}

/**
 * Resolves effective MemoryScope at composition root — not inside services.
 * @see .ai/adr/007-multi-ai-workspace-scope.md
 */
export interface IScopeResolver {
  resolveFromRequest(auth: AuthUser, hints?: ScopeResolutionHints): Promise<MemoryScope>;

  resolveFromMcp(env: McpScopeEnv): Promise<MemoryScope>;
}
