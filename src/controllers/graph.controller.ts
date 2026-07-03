import type { FastifyReply, FastifyRequest } from 'fastify';
import type { GraphService } from '../services/graph.service.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type { TraverseGraphBody } from '../types/graph.js';

function memoryScopeFromRequest(request: FastifyRequest): MemoryScope {
  return { ownerId: request.user?.ownerId ?? '' };
}

export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  async getCapabilities(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.send({ capabilities: this.graphService.getCapabilities() });
  }

  async traverse(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = request.body as TraverseGraphBody;
    const result = await this.graphService.traverseRelations(memoryScopeFromRequest(request), {
      memoryId: body.memoryId,
      depth: body.depth,
      types: body.types,
    });

    reply.send(result);
  }
}

export function createGraphController(graphService: GraphService): GraphController {
  return new GraphController(graphService);
}
