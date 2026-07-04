import type { FastifyReply, FastifyRequest } from 'fastify';
import type { GraphService } from '../services/graph.service.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import type { TraverseGraphBody } from '../types/graph.js';
import { buildTransportContextFromRestRequest } from '../transport/shared/resolve-transport-scope.js';
import {
  createGraphHandlers,
  type GraphHandlers,
} from '../transport/shared/handlers/create-transport-handlers.js';

export class GraphController {
  constructor(private readonly handlers: GraphHandlers) {}

  async getCapabilities(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const capabilities = await this.handlers.getCapabilities.handle(
      buildTransportContextFromRestRequest(_request),
      {},
    );
    reply.send({ capabilities });
  }

  async traverse(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const body = request.body as TraverseGraphBody;
    const result = await this.handlers.traverse.handle(ctx, body);
    reply.send(result);
  }
}

export function createGraphController(
  graphService: GraphService,
  scopeResolver: IScopeResolver,
  handlers?: GraphHandlers,
): GraphController {
  return new GraphController(handlers ?? createGraphHandlers({ graphService, scopeResolver }));
}
