import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import {
  AgentEcosystemManifestBuilder,
  DefaultAgentClientCatalog,
} from '../ecosystem/index.js';
import type { AgentClientType } from '../ecosystem/types/agent-client-type.js';
import { AGENT_CLIENT_TYPES } from '../ecosystem/types/agent-client-type.js';
import { NotFoundError, ValidationError } from '../types/errors.js';

export function createEcosystemController(env: Env) {
  const catalog = new DefaultAgentClientCatalog(env);
  const manifestBuilder = new AgentEcosystemManifestBuilder(env, catalog);

  return {
    async listClients(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const clients = await catalog.listCompatibleProfiles();
      reply.send({ clients, count: clients.length });
    },

    async getClient(
      request: FastifyRequest<{ Params: { type: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const clientType = request.params.type as AgentClientType;
      if (!(AGENT_CLIENT_TYPES as readonly string[]).includes(clientType)) {
        throw new ValidationError(`Unknown client type: ${clientType}`);
      }
      const profile = await catalog.getProfile(clientType);
      if (!profile) {
        throw new NotFoundError(`Client profile not found: ${clientType}`);
      }
      reply.send(profile);
    },

    async getManifest(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const ecosystem = await manifestBuilder.build();
      reply.send(ecosystem);
    },
  };
}

export type EcosystemController = ReturnType<typeof createEcosystemController>;
