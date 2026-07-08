import type { FastifyRequest } from 'fastify';
import type { MemoryScope } from '../../types/memory-scope.js';
import { assertMcpOwnerConfigured } from '../../types/memory-scope.js';
import type {
  IScopeResolver,
  McpScopeEnv,
  ScopeResolutionHints,
} from '../../scope/iscope-resolver.interface.js';
import type {
  GrpcTransportMetadata,
  TransportContext,
  TransportSource,
} from './transport-context.types.js';

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
  const organizationId = headerValue(request.headers, 'x-organization-id');
  const agentId = headerValue(request.headers, 'x-agent-id');
  const query = request.query as { projectId?: string; project_id?: string };
  const projectId = query.projectId ?? query.project_id;

  return {
    organizationId,
    workspaceId,
    agentId,
    projectId: projectId?.trim() || undefined,
  };
}

export function buildTransportContextFromRestRequest(request: FastifyRequest): TransportContext {
  const user = request.user;
  const hints = extractScopeHintsFromRequest(request);

  return {
    requestId: String(request.id),
    ownerId: user?.ownerId ?? '',
    workspaceId: hints.workspaceId,
    agentId: hints.agentId,
    organizationId: headerValue(request.headers, 'x-organization-id'),
    projectId: hints.projectId,
    auth: user ?? null,
    source: 'rest',
    clientIp: request.ip,
  };
}

export function buildTransportContextFromMcpEnv(
  env: McpScopeEnv = mcpScopeEnvFromProcess(),
): TransportContext {
  return {
    requestId: crypto.randomUUID(),
    ownerId: env.ownerId,
    workspaceId: env.workspaceId,
    agentId: env.agentId,
    auth: null,
    source: 'mcp-stdio',
  };
}

export function buildTransportContextFromGrpcMetadata(
  metadata: GrpcTransportMetadata,
): TransportContext {
  return {
    requestId: metadata.requestId?.trim() || crypto.randomUUID(),
    ownerId: metadata.ownerId?.trim() ?? '',
    workspaceId: metadata.workspaceId?.trim(),
    agentId: metadata.agentId?.trim(),
    organizationId: metadata.organizationId?.trim(),
    projectId: metadata.projectId?.trim(),
    auth: null,
    source: 'grpc',
    clientIp: metadata.clientIp?.trim(),
    auditIdentityId: metadata.identityId?.trim(),
  };
}

export function scopeHintsFromTransportContext(ctx: TransportContext): ScopeResolutionHints {
  return {
    organizationId: ctx.organizationId,
    workspaceId: ctx.workspaceId,
    agentId: ctx.agentId,
    projectId: ctx.projectId,
  };
}

/**
 * Resolves MemoryScope from a transport context.
 * Unauthenticated REST/MCP contexts keep owner-only scope (no workspace filter).
 */
export async function resolveMemoryScopeFromTransportContext(
  ctx: TransportContext,
  scopeResolver: IScopeResolver,
): Promise<MemoryScope> {
  if (ctx.source === 'mcp-stdio') {
    return scopeResolver.resolveFromMcp({
      ownerId: ctx.ownerId,
      workspaceId: ctx.workspaceId,
      agentId: ctx.agentId,
    });
  }

  if (ctx.source === 'mcp-remote' && ctx.auth?.ownerId) {
    return scopeResolver.resolveFromRequest(ctx.auth, scopeHintsFromTransportContext(ctx));
  }

  if (!ctx.auth?.ownerId) {
    return { ownerId: ctx.ownerId };
  }

  return scopeResolver.resolveFromRequest(ctx.auth, scopeHintsFromTransportContext(ctx));
}

/**
 * Resolves MemoryScope at the controller boundary.
 * skipAuth tests without a user keep owner-only scope (no workspace filter).
 */
export async function resolveMemoryScopeFromRequest(
  request: FastifyRequest,
  scopeResolver: IScopeResolver,
): Promise<MemoryScope> {
  const ctx = buildTransportContextFromRestRequest(request);
  return resolveMemoryScopeFromTransportContext(ctx, scopeResolver);
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
  const ctx = buildTransportContextFromMcpEnv();
  return resolveMemoryScopeFromTransportContext(ctx, scopeResolver);
}

export function transportSourceLabel(source: TransportSource): string {
  return source;
}
