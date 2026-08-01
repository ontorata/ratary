import type { FastifyReply, FastifyRequest } from 'fastify';
import { getMemoryGovernanceManifest } from '../memory/governance/index.js';
import { parseCreateGovernanceExceptionBody } from '../memory/governance/governance-exception.types.js';
import type { IGovernanceExceptionStore } from '../memory/governance/igovernance-exception-store.interface.js';
import type { IPolicyDenialStore } from '../memory/governance/ipolicy-denial-store.interface.js';
import type { IStewardshipRunStore } from '../memory/stewardship/istewardship-run-store.interface.js';
import { NotFoundError } from '../types/errors.js';

export type GovernanceControllerDeps = Readonly<{
  runStore: IStewardshipRunStore;
  exceptionStore: IGovernanceExceptionStore;
  denialStore: IPolicyDenialStore;
}>;

export function createGovernanceController(deps: GovernanceControllerDeps) {
  const { runStore, exceptionStore, denialStore } = deps;

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

    async listGovernanceExceptions(
      request: FastifyRequest<{ Querystring: { limit?: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const ownerId = request.user!.ownerId;
      const limitRaw = request.query.limit;
      const limit =
        limitRaw !== undefined && limitRaw !== '' ? Number.parseInt(limitRaw, 10) : undefined;
      const exceptions = await exceptionStore.list(ownerId, limit);
      reply.send({ exceptions });
    },

    async getGovernanceException(
      request: FastifyRequest<{ Params: { exceptionId: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const ownerId = request.user!.ownerId;
      const exception = await exceptionStore.getById(ownerId, request.params.exceptionId);
      if (!exception) {
        throw new NotFoundError('GovernanceException', request.params.exceptionId);
      }
      reply.send({ exception });
    },

    async createGovernanceExceptionRequest(
      request: FastifyRequest<{ Body: unknown }>,
      reply: FastifyReply,
    ): Promise<void> {
      const ownerId = request.user!.ownerId;
      const body = parseCreateGovernanceExceptionBody(request.body);
      const exception = await exceptionStore.create({
        ownerId,
        exceptionClass: body.exceptionClass,
        rationale: body.rationale,
        requestedBy: ownerId,
        expiresAt: body.expiresAt,
      });
      reply.status(201).send({ exception });
    },

    async listPolicyDenials(
      request: FastifyRequest<{ Querystring: { limit?: string; since?: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const ownerId = request.user!.ownerId;
      const limitRaw = request.query.limit;
      const limit =
        limitRaw !== undefined && limitRaw !== '' ? Number.parseInt(limitRaw, 10) : undefined;
      const denials = await denialStore.list(ownerId, limit, request.query.since);
      reply.send({ denials });
    },

    async getPolicyDenialSummary(
      request: FastifyRequest<{ Querystring: { since?: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const ownerId = request.user!.ownerId;
      const summary = await denialStore.summarizeByPoint(ownerId, request.query.since);
      reply.send({ summary });
    },
  };
}

export type GovernanceController = ReturnType<typeof createGovernanceController>;
