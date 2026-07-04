import type { FastifyReply, FastifyRequest } from 'fastify';
import { CapabilityManifestBuilder } from '../capabilities/capability-manifest-builder.js';
import type { Env } from '../config/env.js';

export function createCapabilitiesController(env: Env) {
  return {
    async getManifest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const openApiUrl = `${request.protocol}://${request.hostname}/docs/json`;
      const manifest = new CapabilityManifestBuilder(env, { openApiUrl }).build();
      reply.header('X-Protocol-Version', manifest.protocolVersion);
      reply.send(manifest);
    },
  };
}

export type CapabilitiesController = ReturnType<typeof createCapabilitiesController>;
