import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import { buildTransportContextFromRestRequest } from '../transport/shared/resolve-transport-scope.js';
import {
  createCapabilitiesHandlers,
  type CapabilitiesHandlers,
} from '../transport/shared/handlers/create-transport-handlers.js';

export function createCapabilitiesController(env: Env, handlers?: CapabilitiesHandlers) {
  const resolved = handlers ?? createCapabilitiesHandlers({ env });

  return {
    async getManifest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const ctx = buildTransportContextFromRestRequest(request);
      const openApiUrl = `${request.protocol}://${request.hostname}/docs/json`;
      const manifest = await resolved.getManifest.handle(ctx, { openApiUrl });
      reply.header('X-Protocol-Version', manifest.protocolVersion);
      reply.send(manifest);
    },
  };
}

export type CapabilitiesController = ReturnType<typeof createCapabilitiesController>;
