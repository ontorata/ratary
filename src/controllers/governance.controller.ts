import type { FastifyReply, FastifyRequest } from 'fastify';
import { getMemoryGovernanceManifest } from '../memory/governance/index.js';
import type { IStewardshipRunStore } from '../memory/stewardship/istewardship-run-store.interface.js';
import { NotFoundError } from '../types/errors.js';

export function createGovernanceController(runStore: IStewardshipRunStore) {
  return {
    async getManifest(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      reply.send(getMemoryGovernanceManifest());
    },

    async listStewardshipRuns(
      request: FastifyRequest<{ Querystring: { limit?: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const ownerId = request.user!.ownerId;
      const limitRaw = request.query.limit;
      const limit =
        limitRaw !== undefined && limitRaw !== '' ? Number.parseInt(limitRaw, 10) : undefined;
      const runs = await runStore.list(ownerId, limit);
      reply.send({ runs });
    },

    async getStewardshipRun(
      request: FastifyRequest<{ Params: { runId: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const ownerId = request.user!.ownerId;
      const run = await runStore.getByRunId(ownerId, request.params.runId);
      if (!run) {
        throw new NotFoundError('StewardshipRun', request.params.runId);
      }
      reply.send({ run });
    },
  };
}

export type GovernanceController = ReturnType<typeof createGovernanceController>;
