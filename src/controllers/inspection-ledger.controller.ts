import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';
import type { IInspectionPatternStore } from '../learning/inspection/iinspection-pattern-store.interface.js';

export function createInspectionLedgerController(
  scopeResolver: IScopeResolver,
  patternStore: IInspectionPatternStore,
) {
  return {
    async list(
      request: FastifyRequest<{ Querystring: { path?: string; includeArchived?: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const pathPrefix = request.query.path;
      const patterns = pathPrefix
        ? await patternStore.listActiveForRecall(scope, pathPrefix)
        : await patternStore.list(scope, {
            includeArchived: request.query.includeArchived === 'true',
          });
      const contradictions = await patternStore.listContradictions(scope);
      reply.send({ patterns, contradictions });
    },
  };
}

export type InspectionLedgerController = ReturnType<typeof createInspectionLedgerController>;
