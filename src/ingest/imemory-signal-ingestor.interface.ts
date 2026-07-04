import type { MemoryScope } from '../types/memory-scope.js';
import type { IngestResult, MemoryQualitySignal } from './memory-quality-signal.types.js';

export interface IMemorySignalIngestor {
  ingest(scope: MemoryScope, signal: MemoryQualitySignal): Promise<IngestResult>;
}
