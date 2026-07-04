import type { MemoryQualitySignal } from '../../ingest/memory-quality-signal.types.js';

export interface IMemorySignalStore {
  exists(signalId: string): Promise<boolean>;
  append(signal: MemoryQualitySignal): Promise<void>;
}
