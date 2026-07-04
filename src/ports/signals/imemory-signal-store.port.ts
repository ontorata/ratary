import type { MemoryQualitySignal } from '../../ingest/memory-quality-signal.types.js';

export interface IMemorySignalStore {
  exists(signalId: string): Promise<boolean>;
  append(signal: MemoryQualitySignal): Promise<void>;
  listByScope(
    scope: { ownerId: string; workspaceId?: string },
    limit?: number,
  ): Promise<MemoryQualitySignal[]>;
}
