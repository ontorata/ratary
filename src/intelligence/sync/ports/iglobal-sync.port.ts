import type { MemoryScope } from '../../../types/memory-scope.js';
import type {
  GlobalSyncRequest,
  GlobalSyncResult,
  GlobalSyncStatus,
  SyncJournalEntry,
} from '../types/sync.types.js';

/** 5-tier sync orchestrator over Phase 14 exchange (Phase 25 / ADR-043). */
export interface IGlobalSyncOrchestrator {
  sync(request: GlobalSyncRequest, scope: MemoryScope): Promise<GlobalSyncResult>;
  status(scope: MemoryScope): Promise<GlobalSyncStatus>;
}

/** Durable offline sync journal (Phase 25). */
export interface IOfflineJournal {
  append(
    scope: MemoryScope,
    entry: Omit<SyncJournalEntry, 'id' | 'status' | 'createdAt'>,
  ): Promise<SyncJournalEntry>;
  pending(scope: MemoryScope): Promise<SyncJournalEntry[]>;
  markApplied(entryId: string): Promise<void>;
}

/** Telemetry + sync persistence (Phase 25). */
export interface IIntelligenceStore {
  persistTelemetry(
    envelope: import('../../telemetry/types/telemetry-event.js').TelemetryEnvelope,
  ): Promise<void>;
  countTelemetry(scope: MemoryScope, since?: string): Promise<number>;
  countTelemetryByType(scope: MemoryScope, type: string, since?: string): Promise<number>;
  setSyncCursor(scope: MemoryScope, tier: string, cursor: string, runId?: string): Promise<void>;
  getSyncStatus(scope: MemoryScope): Promise<GlobalSyncStatus>;
}
