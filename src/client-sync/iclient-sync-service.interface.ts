import type { MemoryScope } from '../types/memory-scope.js';
import type {
  PullChangesResult,
  PushChangeItem,
  PushChangesResult,
  SyncStatusResult,
} from './client-sync.types.js';

/** Hub SSOT pull/push sync for AI clients (ADR-042). */
export interface IClientSyncService {
  pull(
    scope: MemoryScope,
    platformId: string,
    cursor?: string | null,
  ): Promise<PullChangesResult>;
  push(
    scope: MemoryScope,
    platformId: string,
    changes: PushChangeItem[],
    cursor?: string | null,
  ): Promise<PushChangesResult>;
  getStatus(scope: MemoryScope, platformId: string): Promise<SyncStatusResult>;
}
