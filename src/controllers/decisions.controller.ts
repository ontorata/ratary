import { randomUUID } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import { createRecallService } from '../composition/create-recall-service.js';
import { mapRecallResultToRecommendationCards } from '../decision-intelligence/recommendation.mapper.js';
import {
  parseCreateDecisionProvenanceBody,
  type CreateDecisionProvenanceBody,
} from '../decision-intelligence/decision-provenance.types.js';
import type { IDecisionProvenanceStore } from '../decision-intelligence/in-memory-decision-provenance-store.js';
import { ValidationError } from '../types/errors.js';
import { buildTransportContextFromRestRequest } from '../transport/shared/resolve-transport-scope.js';

export type DecisionsControllerDeps = Readonly<{
  repository: IMemoryRepository;
  env: Env;
  provenanceStore?: IDecisionProvenanceStore;
}>;

export function createDecisionsController(deps: DecisionsControllerDeps) {
  const recallService = createRecallService(deps.repository, deps.env);

  return {
    async fetchRecommendations(
      request: FastifyRequest<{ Body: { query?: string; limit?: number } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const body = request.body as { query?: string; limit?: number };
      const query = body.query?.trim();
      if (!query) {
        throw new ValidationError('query is required');
      }

      const transport = buildTransportContextFromRestRequest(request);
      const organizationId = transport.organizationId ?? request.user!.ownerId;
      const limit = Math.min(body.limit ?? 5, 10);

      const result = await recallService.recall({
        requestId: randomUUID(),
        organizationId,
        query,
        traceContext: { correlationId: randomUUID() },
        workspaceId: transport.workspaceId,
        limit,
      });

      reply.send({
        traceId: result.traceId,
        cards: mapRecallResultToRecommendationCards(result),
        advisory: true as const,
      });
    },

    async recordDecisionProvenance(
      request: FastifyRequest<{ Body: unknown }>,
      reply: FastifyReply,
    ): Promise<void> {
      if (!deps.env.DECISION_PROVENANCE_ENABLED) {
        reply.status(404).send({ error: 'Decision provenance disabled' });
        return;
      }
      if (!deps.provenanceStore) {
        reply.status(503).send({ error: 'Decision provenance store unavailable' });
        return;
      }

      const ownerId = request.user!.ownerId;
      const body: CreateDecisionProvenanceBody = parseCreateDecisionProvenanceBody(request.body);
      const record = await deps.provenanceStore.append(ownerId, body);
      reply.status(201).send({ record });
    },
  };
}

export type DecisionsController = ReturnType<typeof createDecisionsController>;
