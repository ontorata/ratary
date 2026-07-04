import type { Env } from '../config/env.js';
import type { AuditRepository } from '../auth/audit.repository.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import type { MemoryService } from '../services/memory.service.js';
import { AcceptSyncManager } from '../sync/accept-sync-manager.js';
import { SyncStaleDetector } from '../sync/sync-stale-detector.js';
import type { ISyncManager } from '../sync/isync-manager.interface.js';
import {
  ClientSyncService,
  ConflictAwareSyncManager,
  DefaultClientPlatformRegistry,
  FieldMergeResolver,
  LastWriteWinsResolver,
  ManualQueueResolver,
  NoOpClientSyncService,
} from '../client-sync/index.js';
import type { IClientSyncService } from '../client-sync/iclient-sync-service.interface.js';
import type { SyncConflictStrategy } from '../client-sync/client-sync.types.js';
import { SqlSyncCursorStore } from '../infrastructure/client-sync/sql-sync-cursor-store.js';
import { SqlSyncConflictStore } from '../infrastructure/client-sync/sql-sync-conflict-store.js';
import { DefaultMemoryMergePolicy } from '../evolution/default-memory-merge-policy.js';

export interface MultiClientSyncPorts {
  enabled: boolean;
  syncManager: ISyncManager;
  strategy: SyncConflictStrategy;
  createService(memoryService: MemoryService | null): IClientSyncService;
}

function resolveConflictStrategy(env: Env): SyncConflictStrategy {
  return env.MULTI_CLIENT_SYNC_STRATEGY;
}

function createConflictResolver(strategy: SyncConflictStrategy) {
  switch (strategy) {
    case 'field_merge':
      return new FieldMergeResolver();
    case 'manual_queue':
      return new ManualQueueResolver();
    case 'lww':
    default:
      return new LastWriteWinsResolver();
  }
}

/**
 * Composition root for Phase 09.8 multi-client sync (ADR-042).
 * Gated by MULTI_CLIENT_SYNC_ENABLED; SQL stores when MULTI_CLIENT_SYNC_STORE_PROVIDER=sql.
 */
export function createMultiClientSyncPorts(
  sql: ISqlDatabase,
  env: Env,
  audit: AuditRepository,
  options?: { evolutionMergeEnabled?: boolean },
): MultiClientSyncPorts {
  const acceptSyncManager = new AcceptSyncManager(sql, audit);
  const noopFactory = () => new NoOpClientSyncService();

  if (!env.MULTI_CLIENT_SYNC_ENABLED || env.MULTI_CLIENT_SYNC_STORE_PROVIDER !== 'sql') {
    return {
      enabled: false,
      syncManager: acceptSyncManager,
      strategy: 'lww',
      createService: noopFactory,
    };
  }

  const strategy = resolveConflictStrategy(env);
  const staleDetector = new SyncStaleDetector(sql, audit);
  const conflictStore = new SqlSyncConflictStore(sql);
  const cursorStore = new SqlSyncCursorStore(sql);
  const platformRegistry = new DefaultClientPlatformRegistry();
  const resolver = createConflictResolver(strategy);
  const memoryReader = new MemoryRepository(sql);

  const mergePolicy =
    options?.evolutionMergeEnabled && strategy === 'field_merge'
      ? new DefaultMemoryMergePolicy()
      : undefined;

  return {
    enabled: true,
    syncManager: new ConflictAwareSyncManager(staleDetector, resolver, conflictStore),
    strategy,
    createService: (memoryService: MemoryService | null) =>
      new ClientSyncService(
        memoryReader,
        memoryService,
        cursorStore,
        platformRegistry,
        strategy,
        conflictStore,
        mergePolicy,
      ),
  };
}
