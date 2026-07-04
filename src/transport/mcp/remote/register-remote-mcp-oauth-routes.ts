import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../../../config/env.js';
import {
  buildMcpOAuthMetadataContext,
  buildProtectedResourceMetadata,
} from './mcp-oauth-metadata.js';

export async function registerRemoteMcpOAuthRoutes(
  fastify: FastifyInstance,
  env: Env,
): Promise<void> {
  if (!env.REMOTE_MCP_OAUTH_ENABLED) {
    return;
  }

  const resourcePathSuffix = env.REMOTE_MCP_PATH.replace(/^\//, '');

  const serveMetadata = (request: FastifyRequest, reply: FastifyReply): void => {
    const ctx = buildMcpOAuthMetadataContext(env, request.headers.origin);
    if (!ctx) {
      reply.code(503).send({ error: 'MCP OAuth metadata unavailable — configure OIDC_ISSUER_URL' });
      return;
    }
    reply.send(buildProtectedResourceMetadata(ctx));
  };

  fastify.get('/.well-known/oauth-protected-resource', serveMetadata);

  if (resourcePathSuffix) {
    fastify.get(`/.well-known/oauth-protected-resource/${resourcePathSuffix}`, serveMetadata);
  }
}
