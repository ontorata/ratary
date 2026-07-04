import type { MemoryService } from '../services/memory.service.js';
import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import { SyncConflictError } from '../types/errors.js';
import type { MemoryScope } from '../types/memory-scope.js';
import { workspaceIdFromScope } from '../repositories/repository-scope.js';
import { nowISO } from '../utils/memory-mapper.js';
import { DEFAULT_SYNC_PULL_LIMIT } from './client-sync.constants.js';
import type {
  PullChangesResult,
  PushChangeItem,
  PushChangesResult,
  SyncConflictStrategy,
  SyncStatusResult,
} from './client-sync.types.js';
import type { IClientPlatformRegistry } from './iclient-platform-registry.interface.js';
import type { IClientSyncService } from './iclient-sync-service.interface.js';
import type { ISyncCursorStore } from './isync-cursor-store.port.js';
import type { ISyncConflictStore } from './isync-conflict-store.port.js';
import type { Memory } from '../types/memory.js';
import type { IMemoryMergePolicy } from '../evolution/imemory-merge-policy.interface.js';
import { toMemorySnapshot } from '../evolution/memory-evolution.types.js';

export class ClientSyncService implements IClientSyncService {
  constructor(
    private readonly memoryReader: IMemoryRepository,
    private readonly memoryService: MemoryService | null,
    private readonly cursorStore: ISyncCursorStore,
    private readonly platformRegistry: IClientPlatformRegistry,
    private readonly strategy: SyncConflictStrategy,
    private readonly conflictStore?: ISyncConflictStore,
    private readonly mergePolicy?: IMemoryMergePolicy,
  ) {}

  async pull(
    scope: MemoryScope,
    platformId: string,
    cursor?: string | null,
  ): Promise<PullChangesResult> {
    this.platformRegistry.assertKnown(platformId);
    const workspaceId = workspaceIdFromScope(scope);
    const since = cursor ?? (await this.getStoredCursor(scope, platformId))?.cursorValue ?? '';

    const memories = await this.memoryReader.findUpdatedSince({
      ownerId: scope.ownerId,
      workspaceId,
      since,
      limit: DEFAULT_SYNC_PULL_LIMIT + 1,
    });

    const hasMore = memories.length > DEFAULT_SYNC_PULL_LIMIT;
    const page = hasMore ? memories.slice(0, DEFAULT_SYNC_PULL_LIMIT) : memories;
    const nextCursor =
      page.length > 0 ? page[page.length - 1]!.updatedAt : since || nowISO();

    await this.cursorStore.upsert({
      ownerId: scope.ownerId,
      workspaceId,
      platformId: platformId.toLowerCase(),
      cursorValue: nextCursor,
      updatedAt: nowISO(),
    });

    return { memories: page, nextCursor, hasMore };
  }

  async push(
    scope: MemoryScope,
    platformId: string,
    changes: PushChangeItem[],
    cursor?: string | null,
  ): Promise<PushChangesResult> {
    this.platformRegistry.assertKnown(platformId);
    const result: PushChangesResult = {
      accepted: 0,
      rejected: 0,
      queued: 0,
      conflicts: [],
    };

    for (const change of changes) {
      try {
        await this.applyChange(scope, change);
        result.accepted += 1;
      } catch (error) {
        if (error instanceof SyncConflictError) {
          result.rejected += 1;
          result.conflicts.push({
            memoryId: change.memoryId,
            reason: error.message,
          });
          if (this.strategy === 'manual_queue' && this.conflictStore) {
            await this.conflictStore.insert({
              ownerId: scope.ownerId,
              workspaceId: scope.workspaceId,
              platformId: platformId.toLowerCase(),
              memoryId: change.memoryId,
              payload: JSON.stringify(change),
            });
            result.queued += 1;
          }
          continue;
        }
        throw error;
      }
    }

    if (cursor) {
      await this.cursorStore.upsert({
        ownerId: scope.ownerId,
        workspaceId: scope.workspaceId,
        platformId: platformId.toLowerCase(),
        cursorValue: cursor,
        updatedAt: nowISO(),
      });
    }

    return result;
  }

  async getStatus(scope: MemoryScope, platformId: string): Promise<SyncStatusResult> {
    this.platformRegistry.assertKnown(platformId);
    const cursor = await this.getStoredCursor(scope, platformId);
    const pendingConflicts = this.conflictStore
      ? await this.conflictStore.countPending({
          ownerId: scope.ownerId,
          workspaceId: scope.workspaceId,
          platformId: platformId.toLowerCase(),
        })
      : 0;

    return {
      platformId: platformId.toLowerCase(),
      strategy: this.strategy,
      cursor,
      pendingConflicts,
    };
  }

  private async getStoredCursor(scope: MemoryScope, platformId: string) {
    return this.cursorStore.get({
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      platformId: platformId.toLowerCase(),
    });
  }

  private assertMemoryService(): MemoryService {
    if (!this.memoryService) {
      throw new SyncConflictError('MemoryService not available for push operations');
    }
    return this.memoryService;
  }

  private async applyChange(scope: MemoryScope, change: PushChangeItem): Promise<void> {
    const memoryService = this.assertMemoryService();
    if (change.operation === 'create') {
      if (!change.data?.title || !change.data.content) {
        throw new SyncConflictError('Create change requires title and content');
      }
      await memoryService.createMemory(scope, {
        title: change.data.title,
        project: change.data.project ?? '',
        content: change.data.content,
        summary: change.data.summary ?? '',
        tags: change.data.tags ?? [],
        favorite: change.data.favorite ?? false,
      });
      return;
    }

    if (change.operation === 'delete') {
      const existing = await this.memoryReader.findById(
        change.memoryId,
        scope.ownerId,
        workspaceIdFromScope(scope),
      );
      if (!existing) {
        return;
      }
      await memoryService.deleteMemory(
        scope,
        change.memoryId,
        change.expectedUpdatedAt ?? existing.updatedAt,
      );
      return;
    }

    const existing = await this.memoryReader.findById(
      change.memoryId,
      scope.ownerId,
      workspaceIdFromScope(scope),
    );
    if (!existing) {
      throw new SyncConflictError(`Memory ${change.memoryId} not found for update`);
    }

    const merged =
      this.strategy === 'field_merge' && change.data
        ? this.mergeFields(existing, change.data)
        : change.data ?? {};

    await memoryService.updateMemory(scope, change.memoryId, {
      ...merged,
      expectedUpdatedAt: change.expectedUpdatedAt ?? existing.updatedAt,
    });
  }

  private mergeFields(existing: Memory, incoming: NonNullable<PushChangeItem['data']>) {
    if (this.mergePolicy && this.strategy === 'field_merge') {
      const incomingSnapshot = toMemorySnapshot({
        ...existing,
        title: incoming.title ?? existing.title,
        project: incoming.project ?? existing.project,
        content: incoming.content ?? existing.content,
        summary: incoming.summary ?? existing.summary,
        tags: incoming.tags ?? existing.tags,
        favorite: incoming.favorite ?? existing.favorite,
      });
      const merged = this.mergePolicy.merge(toMemorySnapshot(existing), incomingSnapshot);
      return {
        title: merged.title,
        project: merged.project,
        content: merged.content,
        summary: merged.summary,
        tags: merged.tags,
        favorite: merged.favorite,
      };
    }

    return {
      title: incoming.title ?? existing.title,
      project: incoming.project ?? existing.project,
      content: incoming.content ?? existing.content,
      summary: incoming.summary ?? existing.summary,
      tags: incoming.tags ? [...new Set([...existing.tags, ...incoming.tags])] : existing.tags,
      favorite: incoming.favorite ?? existing.favorite,
    };
  }
}

/** No-op when multi-client sync is disabled. */
export class NoOpClientSyncService implements IClientSyncService {
  async pull(): Promise<PullChangesResult> {
    return { memories: [], nextCursor: '', hasMore: false };
  }

  async push(): Promise<PushChangesResult> {
    return { accepted: 0, rejected: 0, queued: 0, conflicts: [] };
  }

  async getStatus(_scope: MemoryScope, platformId: string): Promise<SyncStatusResult> {
    return {
      platformId,
      strategy: 'lww',
      cursor: null,
      pendingConflicts: 0,
    };
  }
}
