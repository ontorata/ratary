import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MemoryEvolutionService } from '../evolution/memory-evolution.service.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';

export function createEvolutionController(
  scopeResolver: IScopeResolver,
  evolutionService: MemoryEvolutionService,
) {
  return {
    async listVersions(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const result = await evolutionService.listVersions(scope, request.params.id);
      reply.send(result);
    },

    async diffVersion(
      request: FastifyRequest<{
        Params: { id: string; version: string };
        Querystring: { against?: string };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const fromVersion = Number.parseInt(request.params.version, 10);
      const againstRaw = request.query.against ?? 'current';
      const against =
        againstRaw === 'current' ? 'current' : Number.parseInt(againstRaw, 10);

      const diff = await evolutionService.diffVersions(scope, request.params.id, fromVersion, against);
      reply.send(diff);
    },
  };
}

export type EvolutionController = ReturnType<typeof createEvolutionController>;
