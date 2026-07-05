import type { AuthUser } from '../../auth/auth.types.js';

/** Inbound protocol that created this context — ADR-027 Phase 10.5, ADR-028 Phase 13. */
export type TransportSource = 'rest' | 'mcp-stdio' | 'mcp-remote' | 'grpc' | 'websocket' | 'sse';

/**
 * Cross-protocol request context at the transport edge.
 * No Fastify, MCP SDK, or gRPC types inward of handlers.
 */
export interface TransportContext {
  readonly requestId: string;
  readonly ownerId: string;
  readonly workspaceId?: string;
  readonly agentId?: string;
  readonly organizationId?: string;
  readonly projectId?: string;
  readonly auth: AuthUser | null;
  readonly source: TransportSource;
  /** Client IP when available (REST/SSE edge). */
  readonly clientIp?: string;
  /** Caller identity when available without full auth (e.g. gRPC metadata). */
  readonly auditIdentityId?: string;
}

/** Optional gRPC metadata keys for scope resolution (Phase 10.5E). */
export interface GrpcTransportMetadata {
  requestId?: string;
  ownerId?: string;
  workspaceId?: string;
  agentId?: string;
  organizationId?: string;
  projectId?: string;
  identityId?: string;
  clientIp?: string;
}
