import type { FastifyReply, FastifyRequest } from 'fastify';
import { CATEGORIES, MEMORY_TYPES } from '../types/knowledge.js';
import type { MemoryService } from '../services/memory.service.js';
import type { MemoryRelationService } from '../services/memory-relation.service.js';
import type { MemoryScope } from '../types/memory.js';
import type { CreateRelationInput } from '../types/knowledge.js';

function memoryScopeFromRequest(request: FastifyRequest): MemoryScope {
  return { ownerId: request.user?.ownerId ?? '' };
}

export class KnowledgeController {
  constructor(private readonly memoryService: MemoryService) {}

  async listCategories(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const used = await this.memoryService.listCategories(memoryScopeFromRequest(request));
    const suggested = CATEGORIES.filter((c) => c !== '');
    const merged = Array.from(new Set([...suggested, ...used])).sort();
    reply.send({ categories: merged });
  }

  async listMemoryTypes(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.send({ memoryTypes: MEMORY_TYPES });
  }
}

export function createKnowledgeController(memoryService: MemoryService): KnowledgeController {
  return new KnowledgeController(memoryService);
}

export class MemoryRelationController {
  constructor(private readonly relationService: MemoryRelationService) {}

  async list(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const relations = await this.relationService.listRelations(
      memoryScopeFromRequest(request),
      request.params.id,
    );
    reply.send({ relations });
  }

  async create(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const relation = await this.relationService.createRelation(
      memoryScopeFromRequest(request),
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
      memoryScopeFromRequest(request),
      request.params.id,
      request.params.relationId,
    );
    reply.status(204).send();
  }
}

export function createMemoryRelationController(
  relationService: MemoryRelationService,
): MemoryRelationController {
  return new MemoryRelationController(relationService);
}
