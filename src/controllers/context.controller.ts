import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ContextService } from '../memory/context.service.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type { BuildContextBody } from '../types/context.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';

export class ContextController {
  constructor(
    private readonly contextService: ContextService,
    private readonly scopeResolver: IScopeResolver,
  ) {}

  private resolveScope(request: FastifyRequest): Promise<MemoryScope> {
    return resolveMemoryScopeFromRequest(request, this.scopeResolver);
  }

  async buildContext(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = request.body as BuildContextBody;
    const result = await this.contextService.buildPrompt(await this.resolveScope(request), {
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
      retrievalPlan: result.retrievalPlan,
    });
  }
}

export function createContextController(
  contextService: ContextService,
  scopeResolver: IScopeResolver,
): ContextController {
  return new ContextController(contextService, scopeResolver);
}
