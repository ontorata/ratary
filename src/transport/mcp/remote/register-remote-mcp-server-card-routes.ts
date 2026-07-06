import type { FastifyInstance } from 'fastify';
import { buildMcpServerCard, MCP_SERVER_CARD_PATH } from './mcp-server-card.js';

export async function registerRemoteMcpServerCardRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(MCP_SERVER_CARD_PATH, async (_request, reply) => {
    reply.header('Cache-Control', 'public, max-age=300');
    return buildMcpServerCard();
  });
}
