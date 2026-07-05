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

    async restoreVersion(
      request: FastifyRequest<{ Params: { id: string; version: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const versionNumber = Number.parseInt(request.params.version, 10);
      const memory = await evolutionService.restoreToVersion(
        scope,
        request.params.id,
        versionNumber,
      );
      reply.send(memory);
    },

    async mergeVersions(
      request: FastifyRequest<{
        Params: { id: string };
        Body: { baseVersion: number; incomingVersion: number | 'current' };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const memory = await evolutionService.mergeVersions(
        scope,
        request.params.id,
        request.body.baseVersion,
        request.body.incomingVersion,
      );
      reply.send(memory);
    },
  };
}

export type EvolutionController = ReturnType<typeof createEvolutionController>;
