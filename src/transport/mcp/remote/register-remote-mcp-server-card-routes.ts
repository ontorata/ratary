import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../../../config/env.js';
import {
  buildBearerOnlyProtectedResourceMetadata,
  buildMcpOAuthMetadataContext,
  buildProtectedResourceMetadata,
} from './mcp-oauth-metadata.js';
import { buildMcpServerCard, MCP_SERVER_CARD_PATH } from './mcp-server-card.js';

export async function registerRemoteMcpServerCardRoutes(
  fastify: FastifyInstance,
  env: Env,
): Promise<void> {
  fastify.get(MCP_SERVER_CARD_PATH, async (_request, reply) => {
    reply.header('Cache-Control', 'public, max-age=300');
    return buildMcpServerCard();
  });

  const serveProtectedResourceMetadata = (request: FastifyRequest, reply: FastifyReply): void => {
    const oauthCtx = buildMcpOAuthMetadataContext(env, request.headers.origin);
    if (oauthCtx) {
      reply.send(buildProtectedResourceMetadata(oauthCtx));
      return;
    }

    const bearerMeta = buildBearerOnlyProtectedResourceMetadata(env, request.headers.origin);
    if (!bearerMeta) {
      reply.code(503).send({ error: 'MCP resource metadata unavailable' });
      return;
    }
    reply.send(bearerMeta);
  };

  const resourcePathSuffix = env.REMOTE_MCP_PATH.replace(/^\//, '');

  fastify.get('/.well-known/oauth-protected-resource', serveProtectedResourceMetadata);
  if (resourcePathSuffix) {
    fastify.get(
      `/.well-known/oauth-protected-resource/${resourcePathSuffix}`,
      serveProtectedResourceMetadata,
    );
  }
}
