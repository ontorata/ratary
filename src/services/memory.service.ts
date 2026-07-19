import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { IEmbeddingStore } from '../embedding/embedding.store.interface.js';
import type { IAgentIdentity } from '../agent/iagent-identity.interface.js';
import type { KnowledgeService } from '../knowledge/knowledge.service.js';
import type { SearchService } from '../search/search.service.js';
import type { IPrecisionSearchService } from '../search/precision/iprecision-search-service.interface.js';
import { getEnv } from '../config/index.js';
import {
  mapSearchQueryToPrecisionRequest,
  type ByPathQueryInput,
  type SimilarMemoryQueryInput,
} from '../types/precision-search.js';
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
import type { IWriteIntentStore } from '../ports/write-intents/iwrite-intent-store.port.js';
import { generateId } from '../utils/memory-mapper.js';

/** PI-C (ADR-067): `replayed` is true when the result was resolved from a prior claim. */
export interface CreateMemoryOutcome {
  memory: Memory;
  replayed: boolean;
}

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
    private readonly precisionSearch?: IPrecisionSearchService,
    private readonly writeIntents?: IWriteIntentStore,
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
    return (await this.createMemoryIdempotent(scope, input)).memory;
  }

  /**
   * PI-C (ADR-067) — idempotent create, constraint-first (owner decision C7).
   *
   * With a `request_id`: claim the (ownerId, requestId) key via PK insert
   * carrying a pre-generated canonical memory id. On key conflict, the ledger
   * mapping resolves the call — memory exists ⇒ replay; memory missing (prior
   * attempt crashed mid-flight) ⇒ resume the create with the SAME canonical id,
   * where the memories.id PRIMARY KEY is the second backstop.
   *
   * Without a `request_id`: identical to the pre-PI-C code path.
   */
  async createMemoryIdempotent(
    scope: MemoryScope,
    input: CreateMemoryInput,
  ): Promise<CreateMemoryOutcome> {
    const requestId = input.request_id?.trim();
    if (!requestId || !this.writeIntents) {
      return { memory: await this.performCreate(scope, input, generateId()), replayed: false };
    }

    const canonicalId = generateId();
    const claim = await this.writeIntents.claim({
      ownerId: scope.ownerId,
      requestId,
      operation: 'create',
      resourceType: 'memory',
      resourceId: canonicalId,
    });

    if (claim.claimed) {
      return {
        memory: await this.completeClaimedCreate(scope, input, canonicalId, requestId),
        replayed: false,
      };
    }

    // Invariant: existing.resourceId is the canonical id allocated exactly
    // once for this (ownerId, requestId) — retries never allocate a new one.
    // Replay lookup is deliberately owner-scoped WITHOUT a workspace filter:
    // the ledger key is (owner_id, request_id), so a retry arriving under a
    // different workspace scope must still resolve to the original memory
    // instead of entering crash recovery and failing on the memories.id PK.
    const existingId = claim.existing.resourceId;
    const found = await this.repository.findById(existingId, scope.ownerId);
    if (found) {
      return { memory: found, replayed: true };
    }

    // Crash recovery: the claim exists but the memory was never created.
    return {
      memory: await this.completeClaimedCreate(scope, input, existingId, requestId),
      replayed: true,
    };
  }

  private async completeClaimedCreate(
    scope: MemoryScope,
    input: CreateMemoryInput,
    id: string,
    requestId: string,
  ): Promise<Memory> {
    let memory: Memory;
    try {
      memory = await this.performCreate(scope, input, id);
    } catch (error) {
      // memories.id PK backstop: a concurrent resumer of the same request
      // already created the row — return it as the canonical result.
      // Owner-scoped lookup, no workspace filter (see createMemoryIdempotent).
      const winner = await this.repository.findById(id, scope.ownerId);
      if (winner) {
        return winner;
      }
      throw error;
    }

    try {
      await this.writeIntents!.markCompleted(scope.ownerId, requestId);
    } catch {
      // Status is observability only — never fail a successful create over it.
    }
    return memory;
  }

  private async performCreate(
    scope: MemoryScope,
    input: CreateMemoryInput,
    id: string,
  ): Promise<Memory> {
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

    await this.reconcileMemoryWrite(scope, id, 'delete', expectedUpdatedAt ?? existing.updatedAt);

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
    if (this.precisionSearch) {
      const env = getEnv();
      const result = await this.precisionSearch.search(
        scope,
        mapSearchQueryToPrecisionRequest(query, env.SEARCH_DEFAULT_MODE),
      );
      return {
        memories: result.hits,
        total: result.total,
        mode: result.mode,
        warnings: result.warnings,
      };
    }
    return this.search.search(scope, query);
  }

  async findSimilarMemories(scope: MemoryScope, query: SimilarMemoryQueryInput) {
    if (!this.precisionSearch) {
      throw new Error('Precision search is disabled');
    }
    return this.precisionSearch.findSimilar(scope, query);
  }

  async getMemoryByPath(scope: MemoryScope, query: ByPathQueryInput) {
    if (!this.precisionSearch) {
      throw new Error('Precision search is disabled');
    }
    return this.precisionSearch.getByPath(scope, query);
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
