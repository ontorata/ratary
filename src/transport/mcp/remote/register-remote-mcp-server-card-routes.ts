import type { FastifyInstance } from 'fastify';
import type { Env } from '../../../config/env.js';
import { buildMcpServerCard, MCP_SERVER_CARD_PATH } from './mcp-server-card.js';
import { registerRemoteMcpOAuthRoutes } from './register-remote-mcp-oauth-routes.js';

export async function registerRemoteMcpServerCardRoutes(
  fastify: FastifyInstance,
  env: Env,
): Promise<void> {
  fastify.get(MCP_SERVER_CARD_PATH, async (_request, reply) => {
    reply.header('Cache-Control', 'public, max-age=300');
    return buildMcpServerCard();
  });

  // RFC 9728 PRM is OAuth-only. API-key servers use server-card.json (SEP-1649) instead.
  if (env.REMOTE_MCP_OAUTH_ENABLED) {
    await registerRemoteMcpOAuthRoutes(fastify, env);
  }
}
