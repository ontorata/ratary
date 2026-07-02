import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ContextService } from '../memory/context.service.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type { BuildContextBody } from '../types/context.js';

function memoryScopeFromRequest(request: FastifyRequest): MemoryScope {
  return { ownerId: request.user?.ownerId ?? '' };
}

export class ContextController {
  constructor(private readonly contextService: ContextService) {}

  async buildContext(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = request.body as BuildContextBody;
    const result = await this.contextService.buildPrompt(memoryScopeFromRequest(request), {
      projectId: body.projectId,
      query: body.query,
      tags: body.tags,
      levels: body.levels,
      limit: body.limit,
      context: body.context,
      task: body.task,
      systemRole: body.systemRole,
    });

    reply.send({
      context: result.context,
      system: result.system,
      user: result.user,
      memories: result.memories.map((memory) => ({
        id: memory.id,
        codename: memory.codename,
        title: memory.title,
        importance: memory.importance,
        relevanceScore: memory.relevanceScore,
        level: memory.level,
      })),
      totalCandidates: result.totalCandidates,
    });
  }
}

export function createContextController(contextService: ContextService): ContextController {
  return new ContextController(contextService);
}
