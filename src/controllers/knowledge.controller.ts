import type { FastifyReply, FastifyRequest } from 'fastify';
import { CATEGORIES, MEMORY_TYPES } from '../types/knowledge.js';
import type { MemoryService } from '../services/memory.service.js';
import type { MemoryRelationService } from '../services/memory-relation.service.js';
import type { MemoryScope } from '../types/memory.js';
import type { CreateRelationInput } from '../types/knowledge.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';

export class KnowledgeController {
  constructor(
    private readonly memoryService: MemoryService,
    private readonly scopeResolver: IScopeResolver,
  ) {}

  private resolveScope(request: FastifyRequest): Promise<MemoryScope> {
    return resolveMemoryScopeFromRequest(request, this.scopeResolver);
  }

  async listCategories(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const used = await this.memoryService.listCategories(await this.resolveScope(request));
    const suggested = CATEGORIES.filter((c) => c !== '');
    const merged = Array.from(new Set([...suggested, ...used])).sort();
    reply.send({ categories: merged });
  }

  async listMemoryTypes(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.send({ memoryTypes: MEMORY_TYPES });
  }
}

export function createKnowledgeController(
  memoryService: MemoryService,
  scopeResolver: IScopeResolver,
): KnowledgeController {
  return new KnowledgeController(memoryService, scopeResolver);
}

export class MemoryRelationController {
  constructor(
    private readonly relationService: MemoryRelationService,
    private readonly scopeResolver: IScopeResolver,
  ) {}

  private resolveScope(request: FastifyRequest): Promise<MemoryScope> {
    return resolveMemoryScopeFromRequest(request, this.scopeResolver);
  }

  async list(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const relations = await this.relationService.listRelations(
      await this.resolveScope(request),
      request.params.id,
    );
    reply.send({ relations });
  }

  async create(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const relation = await this.relationService.createRelation(
      await this.resolveScope(request),
      request.params.id,
      request.body as CreateRelationInput,
      request.user?.identityId,
    );
    reply.status(201).send(relation);
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string; relationId: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.relationService.deleteRelation(
      await this.resolveScope(request),
      request.params.id,
      request.params.relationId,
    );
    reply.status(204).send();
  }
}

export function createMemoryRelationController(
  relationService: MemoryRelationService,
  scopeResolver: IScopeResolver,
): MemoryRelationController {
  return new MemoryRelationController(relationService, scopeResolver);
}
