import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IClientSyncService } from '../client-sync/iclient-sync-service.interface.js';
import type { PushChangeItem } from '../client-sync/client-sync.types.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';

export function createClientSyncController(
  scopeResolver: IScopeResolver,
  clientSyncService: IClientSyncService,
) {
  return {
    async getStatus(
      request: FastifyRequest<{ Querystring: { platformId: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const status = await clientSyncService.getStatus(scope, request.query.platformId);
      reply.send(status);
    },

    async pull(
      request: FastifyRequest<{
        Querystring: { platformId: string; cursor?: string };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const result = await clientSyncService.pull(
        scope,
        request.query.platformId,
        request.query.cursor,
      );
      reply.send(result);
    },

    async push(
      request: FastifyRequest<{
        Body: {
          platformId: string;
          cursor?: string;
          changes: PushChangeItem[];
        };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const { platformId, cursor, changes } = request.body;
      const result = await clientSyncService.push(scope, platformId, changes, cursor);
      reply.send(result);
    },
  };
}

export type ClientSyncController = ReturnType<typeof createClientSyncController>;
