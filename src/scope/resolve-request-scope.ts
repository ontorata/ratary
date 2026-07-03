import type { FastifyRequest } from 'fastify';
import type { MemoryScope } from '../types/memory-scope.js';
import { assertMcpOwnerConfigured } from '../types/memory-scope.js';
import type {
  IScopeResolver,
  McpScopeEnv,
  ScopeResolutionHints,
} from './iscope-resolver.interface.js';

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

/** Reads optional workspace/agent/project hints from REST transport (ADR-007). */
export function extractScopeHintsFromRequest(request: FastifyRequest): ScopeResolutionHints {
  const workspaceId = headerValue(request.headers, 'x-workspace-id');
  const agentId = headerValue(request.headers, 'x-agent-id');
  const query = request.query as { projectId?: string; project_id?: string };
  const projectId = query.projectId ?? query.project_id;

  return {
    workspaceId,
    agentId,
    projectId: projectId?.trim() || undefined,
  };
}

/**
 * Resolves MemoryScope at the controller boundary.
 * skipAuth tests without a user keep owner-only scope (no workspace filter).
 */
export async function resolveMemoryScopeFromRequest(
  request: FastifyRequest,
  scopeResolver: IScopeResolver,
): Promise<MemoryScope> {
  const user = request.user;
  if (!user?.ownerId) {
    return { ownerId: user?.ownerId ?? '' };
  }

  return scopeResolver.resolveFromRequest(user, extractScopeHintsFromRequest(request));
}

export function mcpScopeEnvFromProcess(): McpScopeEnv {
  assertMcpOwnerConfigured();
  return {
    ownerId: process.env.MCP_OWNER_ID ?? '',
    workspaceId: process.env.MCP_WORKSPACE_ID?.trim(),
    agentId: process.env.MCP_AGENT_ID?.trim(),
  };
}

/** Resolves MCP scope per tool call via DefaultScopeResolver (ADR-007 step 7). */
export async function resolveMcpMemoryScope(scopeResolver: IScopeResolver): Promise<MemoryScope> {
  return scopeResolver.resolveFromMcp(mcpScopeEnvFromProcess());
}
