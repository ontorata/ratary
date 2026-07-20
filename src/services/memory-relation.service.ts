import type { IMemoryReader } from '../repositories/memory.repository.interface.js';
import type { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import type { CreateRelationInput, MemoryRelation } from '../types/knowledge.js';
import type { MemoryScope } from '../types/memory.js';
import { NotFoundError, ValidationError } from '../types/errors.js';
import { workspaceIdFromScope } from '../repositories/repository-scope.js';
import { enforceProvenanceMetadata, isProvenanceRelationType } from '../types/provenance.js';

export class MemoryRelationService {
  constructor(
    private readonly relationRepository: MemoryRelationRepository,
    private readonly memoryRepository: IMemoryReader,
  ) {}

  async listRelations(scope: MemoryScope, memoryId: string): Promise<MemoryRelation[]> {
    const workspaceId = workspaceIdFromScope(scope);
    const memory = await this.memoryRepository.findById(memoryId, scope.ownerId, workspaceId);
    if (!memory) {
      throw new NotFoundError('Memory', memoryId);
    }
    return this.relationRepository.findByMemoryId(memoryId, scope.ownerId, workspaceId);
  }

  async createRelation(
    scope: MemoryScope,
    sourceMemoryId: string,
    input: CreateRelationInput,
    createdBy?: string | null,
  ): Promise<MemoryRelation> {
    const workspaceId = workspaceIdFromScope(scope);
    const source = await this.memoryRepository.findById(sourceMemoryId, scope.ownerId, workspaceId);
    if (!source) {
      throw new NotFoundError('Memory', sourceMemoryId);
    }

    const target = await this.memoryRepository.findById(
      input.targetMemoryId,
      scope.ownerId,
      workspaceId,
    );
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

    let metadata = input.metadata ?? {};
    if (isProvenanceRelationType(input.relation)) {
      try {
        metadata = enforceProvenanceMetadata(input.relation, metadata);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'invalid provenance metadata';
        throw new ValidationError(message);
      }
    }

    return this.relationRepository.createFromInput(
      sourceMemoryId,
      scope.ownerId,
      { ...input, metadata },
      createdBy,
    );
  }

  async deleteRelation(scope: MemoryScope, memoryId: string, relationId: string): Promise<void> {
    const workspaceId = workspaceIdFromScope(scope);
    const memory = await this.memoryRepository.findById(memoryId, scope.ownerId, workspaceId);
    if (!memory) {
      throw new NotFoundError('Memory', memoryId);
    }

    const deleted = await this.relationRepository.delete(relationId, scope.ownerId);
    if (!deleted) {
      throw new NotFoundError('Relation', relationId);
    }
  }
}
