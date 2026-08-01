import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ContextService } from '../memory/context.service.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import type { BuildContextBody } from '../types/context.js';
import { buildTransportContextFromRestRequest } from '../transport/shared/resolve-transport-scope.js';
import {
  createContextHandlers,
  type ContextHandlers,
} from '../transport/shared/handlers/create-transport-handlers.js';

function packageIdParam(request: FastifyRequest): string {
  return (request.params as { packageId: string }).packageId;
}

export class ContextController {
  constructor(private readonly handlers: ContextHandlers) {}

  async buildContext(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = request.body as BuildContextBody;
    const ctx = buildTransportContextFromRestRequest(request);
    const result = await this.handlers.buildPrompt.handle(ctx, body);

    reply.send({
      packageId: result.packageId,
      ownerId: result.ownerId,
      createdAt: result.createdAt,
      confidence: result.confidence,
      confidenceModel: result.confidenceModel,
      updateMechanism: result.updateMechanism,
      lifecycleState: result.lifecycleState,
      sourceLabels: result.sourceLabels,
      query: result.query,
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
      retrievalMemo: result.retrievalMemo,
    });
  }

  async getPackageLifecycle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const record = await this.handlers.getPackageLifecycle.handle(ctx, {
      packageId: packageIdParam(request),
    });
    reply.send(record);
  }

  async retirePackage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const record = await this.handlers.retirePackage.handle(ctx, {
      packageId: packageIdParam(request),
    });
    reply.send(record);
  }

  async archivePackage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const record = await this.handlers.archivePackage.handle(ctx, {
      packageId: packageIdParam(request),
    });
    reply.send(record);
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
