import type { MemorySnapshot } from './memory-evolution.types.js';

export interface IMemoryMergePolicy {
  merge(base: MemorySnapshot, incoming: MemorySnapshot): MemorySnapshot;
}
