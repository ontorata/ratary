import type { MemoryRepository } from '../repositories/memory.repository.js';
import type { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import type { CreateRelationInput, MemoryRelation } from '../types/knowledge.js';
import type { MemoryScope } from '../types/memory.js';
import { NotFoundError, ValidationError } from '../types/errors.js';

export class MemoryRelationService {
  constructor(
    private readonly relationRepository: MemoryRelationRepository,
    private readonly memoryRepository: MemoryRepository,
  ) {}

  async listRelations(scope: MemoryScope, memoryId: string): Promise<MemoryRelation[]> {
    const memory = await this.memoryRepository.findById(memoryId, scope.ownerId);
    if (!memory) {
      throw new NotFoundError('Memory', memoryId);
    }
    return this.relationRepository.findByMemoryId(memoryId, scope.ownerId);
  }

  async createRelation(
    scope: MemoryScope,
    sourceMemoryId: string,
    input: CreateRelationInput,
    createdBy?: string | null,
  ): Promise<MemoryRelation> {
    const source = await this.memoryRepository.findById(sourceMemoryId, scope.ownerId);
    if (!source) {
      throw new NotFoundError('Memory', sourceMemoryId);
    }

    const target = await this.memoryRepository.findById(input.targetMemoryId, scope.ownerId);
    if (!target) {
      throw new NotFoundError('Memory', input.targetMemoryId);
    }

    if (sourceMemoryId === input.targetMemoryId) {
      throw new ValidationError('Cannot relate memory to itself');
    }

    const exists = await this.relationRepository.exists(
      sourceMemoryId,
      input.targetMemoryId,
      input.relation,
      scope.ownerId,
    );
    if (exists) {
      throw new ValidationError('Relation already exists');
    }

    return this.relationRepository.createFromInput(sourceMemoryId, scope.ownerId, input, createdBy);
  }

  async deleteRelation(scope: MemoryScope, memoryId: string, relationId: string): Promise<void> {
    const memory = await this.memoryRepository.findById(memoryId, scope.ownerId);
    if (!memory) {
      throw new NotFoundError('Memory', memoryId);
    }

    const deleted = await this.relationRepository.delete(relationId, scope.ownerId);
    if (!deleted) {
      throw new NotFoundError('Relation', relationId);
    }
  }
}
