import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { IEmbeddingStore } from '../embedding/embedding.store.interface.js';
import type { IAgentIdentity } from '../agent/iagent-identity.interface.js';
import type { KnowledgeService } from '../knowledge/knowledge.service.js';
import type { SearchService } from '../search/search.service.js';
import type {
  Memory,
  CreateMemoryInput,
  UpdateMemoryInput,
  ListMemoriesQuery,
  SearchQuery,
  BackupImportInput,
  MemoryScope,
} from '../types/memory.js';
import type { MemoryType } from '../types/knowledge.js';
import { DEFAULT_MEMORY_LEVEL } from '../types/memory-level.js';
import { NotFoundError, SyncConflictError } from '../types/errors.js';
import { workspaceIdFromScope } from '../repositories/repository-scope.js';
import { hasWorkspaceScope } from '../types/memory-scope.js';
import type { ISyncManager, MemoryWriteEvent } from '../sync/isync-manager.interface.js';
import type { IMemoryEvolutionCoordinator } from '../evolution/memory-evolution-coordinator.js';
import type { IMemoryDomainEventCoordinator } from '../events/memory-domain-event-coordinator.js';
import { generateId } from '../utils/memory-mapper.js';

export class MemoryService {
  constructor(
    private readonly repository: IMemoryRepository,
    private readonly knowledge: KnowledgeService,
    private readonly search: SearchService,
    private readonly embeddingStore?: IEmbeddingStore,
    private readonly syncManager?: ISyncManager,
    private readonly agentIdentity?: IAgentIdentity,
    private readonly evolution?: IMemoryEvolutionCoordinator,
    private readonly domainEvents?: IMemoryDomainEventCoordinator,
  ) {}

  private async resolveAttributionAgentId(scope: MemoryScope): Promise<string | undefined> {
    const hint = scope.agentId?.trim();
    if (!hint || !this.agentIdentity || !hasWorkspaceScope(scope)) {
      return undefined;
    }

    const agent = await this.agentIdentity.resolve(scope, hint);
    return agent?.id;
  }

  private async reconcileMemoryWrite(
    scope: MemoryScope,
    memoryId: string,
    operation: MemoryWriteEvent['operation'],
    expectedUpdatedAt?: string | null,
  ): Promise<void> {
    if (!this.syncManager) {
      return;
    }

    const result = await this.syncManager.reconcileWrite({
      scope,
      memoryId,
      operation,
      expectedUpdatedAt,
    });
    if (result === 'reject') {
      throw new SyncConflictError('Memory write rejected due to sync conflict');
    }
  }

  async createMemory(scope: MemoryScope, input: CreateMemoryInput): Promise<Memory> {
    const enriched = await this.knowledge.enrichForCreate(scope.ownerId, {
      title: input.title,
      project: input.project,
      content: input.content,
      summary: input.summary,
      tags: input.tags,
      keywords: input.keywords,
      category: input.category,
      memoryType: input.memoryType,
      importance: input.importance,
      language: input.language,
      notes: input.notes,
    });

    const id = generateId();
    const agentId = await this.resolveAttributionAgentId(scope);
    await this.reconcileMemoryWrite(scope, id, 'create');

    const memory = await this.repository.insert({
      id,
      title: input.title,
      project: input.project,
      content: input.content,
      summary: enriched.summary,
      tags: input.tags,
      keywords: enriched.keywords,
      category: enriched.category,
      memoryType: enriched.memoryType,
      importance: enriched.importance,
      language: enriched.language,
      notes: enriched.notes,
      codename: enriched.codename,
      slug: enriched.slug,
      favorite: input.favorite,
      archived: false,
      ownerId: scope.ownerId,
      workspaceId: workspaceIdFromScope(scope),
      level: input.level ?? DEFAULT_MEMORY_LEVEL,
      lastModifiedByAgentId: agentId ?? null,
    });

    if (this.evolution?.enabled) {
      await this.evolution.onMemoryCreated(scope, memory);
    }

    if (this.domainEvents?.enabled) {
      void this.domainEvents.onMemoryCreated(scope, memory);
    }

    return memory;
  }

  async updateMemory(scope: MemoryScope, id: string, input: UpdateMemoryInput): Promise<Memory> {
    const workspaceId = workspaceIdFromScope(scope);
    const existing = await this.repository.findById(id, scope.ownerId, workspaceId);
    if (!existing) {
      throw new NotFoundError('Memory', id);
    }

    const enriched = await this.knowledge.enrichForUpdate(
      scope.ownerId,
      {
        ...existing,
        memoryType: existing.memoryType as MemoryType,
      },
      {
        title: input.title,
        project: input.project,
        content: input.content,
        summary: input.summary,
        tags: input.tags,
        keywords: input.keywords,
        category: input.category,
        memoryType: input.memoryType,
        importance: input.importance,
        language: input.language,
        notes: input.notes,
      },
    );

    const agentId = await this.resolveAttributionAgentId(scope);
    await this.reconcileMemoryWrite(
      scope,
      id,
      'update',
      input.expectedUpdatedAt ?? existing.updatedAt,
    );

    if (this.evolution?.enabled) {
      await this.evolution.onMemoryUpdated(scope, existing, agentId ?? null);
    }

    const updated = await this.repository.update(
      id,
      scope.ownerId,
      {
        title: input.title,
        project: input.project,
        content: input.content,
        summary: enriched.summary,
        tags: input.tags,
        keywords: enriched.keywords,
        category: enriched.category,
        memoryType: enriched.memoryType,
        importance: enriched.importance,
        language: enriched.language,
        notes: enriched.notes,
        slug: enriched.slug,
        favorite: input.favorite,
        lastModifiedByAgentId: agentId ?? null,
      },
      workspaceId,
    );

    if (!updated) {
      throw new NotFoundError('Memory', id);
    }

    if (this.domainEvents?.enabled) {
      void this.domainEvents.onMemoryUpdated(scope, updated);
    }

    return updated;
  }

  async deleteMemory(
    scope: MemoryScope,
    id: string,
    expectedUpdatedAt?: string | null,
  ): Promise<void> {
    const workspaceId = workspaceIdFromScope(scope);
    const existing = await this.repository.findById(id, scope.ownerId, workspaceId);
    if (!existing) {
      throw new NotFoundError('Memory', id);
    }

    await this.reconcileMemoryWrite(
      scope,
      id,
      'delete',
      expectedUpdatedAt ?? existing.updatedAt,
    );

    const deleted = await this.repository.delete(id, scope.ownerId, workspaceId);
    if (!deleted) {
      throw new NotFoundError('Memory', id);
    }

    if (this.embeddingStore) {
      await this.embeddingStore.deleteByMemoryId(id, scope.ownerId);
    }

    if (this.domainEvents?.enabled) {
      void this.domainEvents.onMemoryDeleted(scope, id);
    }
  }

  async getMemoryById(scope: MemoryScope, id: string): Promise<Memory> {
    const memory = await this.repository.findById(id, scope.ownerId, workspaceIdFromScope(scope));
    if (!memory) {
      throw new NotFoundError('Memory', id);
    }
    return memory;
  }

  async getMemoryByCodename(scope: MemoryScope, codename: string): Promise<Memory> {
    const memory = await this.repository.findByCodename(
      scope.ownerId,
      codename,
      workspaceIdFromScope(scope),
    );
    if (!memory) {
      throw new NotFoundError('Memory', codename);
    }
    return memory;
  }

  async getMemoryBySlug(scope: MemoryScope, slug: string): Promise<Memory> {
    const memory = await this.repository.findBySlug(
      scope.ownerId,
      slug,
      workspaceIdFromScope(scope),
    );
    if (!memory) {
      throw new NotFoundError('Memory', slug);
    }
    return memory;
  }

  async listMemories(
    scope: MemoryScope,
    query: ListMemoriesQuery,
  ): Promise<{ memories: Memory[]; total: number }> {
    return this.repository.findAll({
      ownerId: scope.ownerId,
      workspaceId: workspaceIdFromScope(scope),
      project: query.project,
      favorite: query.favorite,
      archived: query.archived,
      limit: query.limit,
      offset: query.offset,
    });
  }

  async searchMemory(scope: MemoryScope, query: SearchQuery) {
    return this.search.search(scope, query);
  }

  async toggleFavorite(scope: MemoryScope, id: string): Promise<Memory> {
    const memory = await this.repository.toggleFavorite(
      id,
      scope.ownerId,
      workspaceIdFromScope(scope),
    );
    if (!memory) {
      throw new NotFoundError('Memory', id);
    }
    return memory;
  }

  async archiveMemory(scope: MemoryScope, id: string, archived = true): Promise<Memory> {
    const memory = await this.repository.archive(
      id,
      scope.ownerId,
      archived,
      workspaceIdFromScope(scope),
    );
    if (!memory) {
      throw new NotFoundError('Memory', id);
    }
    return memory;
  }

  async listProjects(scope: MemoryScope): Promise<string[]> {
    return this.repository.listProjects(scope.ownerId, workspaceIdFromScope(scope));
  }

  async listTags(scope: MemoryScope): Promise<string[]> {
    return this.repository.listTags(scope.ownerId, workspaceIdFromScope(scope));
  }

  async listCategories(scope: MemoryScope): Promise<string[]> {
    return this.repository.listDistinctCategories(scope.ownerId, workspaceIdFromScope(scope));
  }

  async exportBackup(scope: MemoryScope): Promise<{ memories: Memory[] }> {
    const memories = await this.repository.findAllByOwner(
      scope.ownerId,
      workspaceIdFromScope(scope),
    );
    return { memories };
  }

  async importBackup(scope: MemoryScope, input: BackupImportInput): Promise<{ imported: number }> {
    let imported = 0;

    for (const item of input.memories) {
      await this.createMemory(scope, {
        title: item.title,
        project: item.project,
        content: item.content,
        summary: item.summary,
        tags: item.tags,
        favorite: item.favorite,
        level: 'raw',
      });
      imported++;
    }

    return { imported };
  }

  async replaceBackup(scope: MemoryScope, input: BackupImportInput): Promise<{ imported: number }> {
    if (this.embeddingStore) {
      await this.embeddingStore.deleteAllByOwner(scope.ownerId);
    }

    await this.repository.deleteAllByOwner(scope.ownerId, workspaceIdFromScope(scope));

    let imported = 0;
    for (const item of input.memories) {
      await this.createMemory(scope, {
        title: item.title,
        project: item.project,
        content: item.content,
        summary: item.summary,
        tags: item.tags,
        favorite: item.favorite,
        level: 'raw',
      });
      imported++;
    }

    return { imported };
  }
}
