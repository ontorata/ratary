import type { MemorySnapshot, MemoryVersionDiff } from './memory-evolution.types.js';

export interface IMemoryDiffEngine {
  diff(
    memoryId: string,
    fromVersion: number | 'current',
    toVersion: number | 'current',
    before: MemorySnapshot,
    after: MemorySnapshot,
  ): MemoryVersionDiff;
}
