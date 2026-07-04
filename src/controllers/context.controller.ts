import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ContextService } from '../memory/context.service.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import type { BuildContextBody } from '../types/context.js';
import { buildTransportContextFromRestRequest } from '../transport/shared/resolve-transport-scope.js';
import {
  createContextHandlers,
  type ContextHandlers,
} from '../transport/shared/handlers/create-transport-handlers.js';

export class ContextController {
  constructor(private readonly handlers: ContextHandlers) {}

  async buildContext(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = request.body as BuildContextBody;
    const ctx = buildTransportContextFromRestRequest(request);
    const result = await this.handlers.buildPrompt.handle(ctx, body);

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
  handlers?: ContextHandlers,
): ContextController {
  return new ContextController(
    handlers ?? createContextHandlers({ contextService, scopeResolver }),
  );
}
