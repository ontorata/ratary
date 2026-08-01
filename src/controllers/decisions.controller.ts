import { randomUUID } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import { createRecallService } from '../composition/create-recall-service.js';
import { mapRecallResultToRecommendationCards } from '../decision-intelligence/recommendation.mapper.js';
import { applyRecommendationRerank } from '../decision-intelligence/apply-recommendation-rerank.js';
import {
  parseCreateDecisionProvenanceBody,
  type CreateDecisionProvenanceBody,
} from '../decision-intelligence/decision-provenance.types.js';
import type { IDecisionProvenanceStore } from '../decision-intelligence/in-memory-decision-provenance-store.js';
import {
  getDecisionModelAllowlistFromEnv,
  listAuthorizedDecisionModels,
} from '../decision-intelligence/decision-model-catalog.js';
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
      request: FastifyRequest<{
        Body: {
          query?: string;
          limit?: number;
          decisionModelId?: string;
          decisionModelVersion?: string;
        };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      const body = request.body as {
        query?: string;
        limit?: number;
        decisionModelId?: string;
        decisionModelVersion?: string;
      };
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

      const initialCards = mapRecallResultToRecommendationCards(result);
      const allowlist = getDecisionModelAllowlistFromEnv();
      const { cards, rerank } = await applyRecommendationRerank({
        cards: initialCards,
        traceId: result.traceId,
        decisionModelId: body.decisionModelId,
        decisionModelVersion: body.decisionModelVersion,
        allowlist,
      });

      reply.send({
        traceId: result.traceId,
        cards,
        advisory: true as const,
        ...(rerank ? { rerank } : {}),
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

    async listDecisionModels(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const allowlist = getDecisionModelAllowlistFromEnv();
      const models = listAuthorizedDecisionModels(allowlist);
      reply.send({ models });
    },
  };
}

export type DecisionsController = ReturnType<typeof createDecisionsController>;
