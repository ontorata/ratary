import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IKnowledgeExchangeService } from '../federation/ports/iknowledge-exchange.port.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';

export function createFederationController(
  scopeResolver: IScopeResolver,
  exchangeService: IKnowledgeExchangeService,
) {
  return {
    async listPeers(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(_request, scopeResolver);
      const peers = await exchangeService.listPeers(scope);
      reply.send({ peers });
    },

    async getStatus(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const status = await exchangeService.getStatus(scope);
      reply.send(status);
    },

    async pull(
      request: FastifyRequest<{
        Body: {
          peerId: string;
          sourceNodeId: string;
          sourceWorkspaceId?: string;
          sourceOwnerId: string;
          targetWorkspaceId?: string;
          memoryIds?: string[];
          cursor?: string;
          limit?: number;
        };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const body = request.body;
      const result = await exchangeService.pullAndApply(
        body.peerId,
        {
          source: {
            nodeId: body.sourceNodeId,
            ownerId: body.sourceOwnerId,
            workspaceId: body.sourceWorkspaceId,
          },
          target: {
            nodeId: body.peerId,
            ownerId: scope.ownerId,
            workspaceId: body.targetWorkspaceId ?? scope.workspaceId,
            organizationId: scope.organizationId,
          },
          memoryIds: body.memoryIds,
          cursor: body.cursor,
          limit: body.limit,
        },
        scope,
      );
      reply.send(result);
    },

    async push(
      request: FastifyRequest<{
        Body: {
          peerId: string;
          memoryIds: string[];
        };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const result = await exchangeService.pushToPeer(
        request.body.peerId,
        request.body.memoryIds,
        scope,
      );
      reply.send(result);
    },
  };
}

export type FederationController = ReturnType<typeof createFederationController>;
