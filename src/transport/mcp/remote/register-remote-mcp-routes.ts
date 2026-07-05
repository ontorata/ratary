import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Env } from '../../../config/env.js';
import type { TransportHandlers } from '../../shared/handlers/create-transport-handlers.js';
import { buildMcpOAuthMetadataContext, buildMcpUnauthorizedHeaders } from './mcp-oauth-metadata.js';
import {
  buildTransportContextFromRestRequest,
  resolveMemoryScopeFromTransportContext,
} from '../../shared/resolve-transport-scope.js';
import type { IScopeResolver } from '../../../scope/iscope-resolver.interface.js';
import type { IAgentIdentity } from '../../../agent/iagent-identity.interface.js';
import type { ISqlDatabase } from '../../../ports/sql/isql-database.port.js';
import { createMcpServer } from '../mcp-server.js';
import { createRemoteMcpBinding } from '../mcp-context-binding.js';
import { isInitializeRequest, runWithMcpRemoteSession } from './mcp-remote-context.js';

interface McpRemoteSessionEntry {
  transport: StreamableHTTPServerTransport;
  server: McpServer;
}

const sessions = new Map<string, McpRemoteSessionEntry>();

export interface RemoteMcpRouteDeps {
  env: Env;
  handlers: TransportHandlers;
  scopeResolver: IScopeResolver;
  agentIdentity: IAgentIdentity;
  sql: ISqlDatabase;
  path: string;
  corsOrigins: string;
}

function parseCorsOrigins(value: string): string | string[] {
  if (value.trim() === '*') return '*';
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function applyCors(reply: FastifyReply, origins: string | string[], requestOrigin?: string): void {
  if (origins === '*') {
    reply.header('Access-Control-Allow-Origin', '*');
    return;
  }
  const allowed = Array.isArray(origins) ? origins : [origins];
  if (requestOrigin && allowed.includes(requestOrigin)) {
    reply.header('Access-Control-Allow-Origin', requestOrigin);
  }
}

export async function registerRemoteMcpRoutes(
  fastify: FastifyInstance,
  deps: RemoteMcpRouteDeps,
): Promise<void> {
  const corsOrigins = parseCorsOrigins(deps.corsOrigins);
  const bindingFactory = () => createRemoteMcpBinding(deps.scopeResolver);

  const handleMcp = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    applyCors(reply, corsOrigins, request.headers.origin);

    if (!request.user?.ownerId) {
      const oauthCtx = buildMcpOAuthMetadataContext(deps.env, request.headers.origin);
      if (deps.env.REMOTE_MCP_OAUTH_ENABLED && oauthCtx) {
        reply.code(401).headers(buildMcpUnauthorizedHeaders(oauthCtx)).send({
          error: 'Unauthorized',
          message: 'OAuth authentication required — see WWW-Authenticate resource_metadata',
        });
        return;
      }
      reply.code(401).send({ error: 'Unauthorized — Bearer aic_... or X-API-Key required' });
      return;
    }

    const ctx = buildTransportContextFromRestRequest(request);
    const remoteCtx = { ...ctx, source: 'mcp-remote' as const };
    const sessionId = headerValue(request.headers, 'mcp-session-id');
    const body = request.body;

    await runWithMcpRemoteSession(
      {
        ctx: remoteCtx,
        resolveScope: () => resolveMemoryScopeFromTransportContext(remoteCtx, deps.scopeResolver),
      },
      async () => {
        let entry = sessionId ? sessions.get(sessionId) : undefined;

        if (!entry && isInitializeRequest(body)) {
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessionclosed: (id) => {
              sessions.delete(id);
            },
          });
          const server = createMcpServer(
            deps.handlers,
            bindingFactory(),
            deps.agentIdentity,
            deps.sql,
            { mcpTransport: 'streamable-http' },
          );
          await server.connect(transport);
          entry = { transport, server };
          if (transport.sessionId) {
            sessions.set(transport.sessionId, entry);
          }
        }

        if (!entry) {
          reply.code(sessionId ? 404 : 400).send({
            error: sessionId ? 'Unknown MCP session' : 'MCP session id required after initialize',
          });
          return;
        }

        reply.hijack();
        await entry.transport.handleRequest(request.raw, reply.raw, body);
      },
    );
  };

  fastify.options(deps.path, async (request, reply) => {
    applyCors(reply, corsOrigins, request.headers.origin);
    reply
      .header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
      .header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-API-Key, mcp-session-id, MCP-Protocol-Version',
      )
      .code(204)
      .send();
  });

  fastify.route({
    method: ['GET', 'POST', 'DELETE'],
    url: deps.path,
    handler: handleMcp,
  });
}

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const raw = headers[name];
  if (typeof raw === 'string') return raw.trim() || undefined;
  if (Array.isArray(raw) && raw[0]) return raw[0].trim() || undefined;
  return undefined;
}

/** Test helper — clears in-memory MCP sessions. */
export function resetRemoteMcpSessions(): void {
  sessions.clear();
}
