import type { MemoryHeadRecord } from './memory-evolution.types.js';

export interface IMemoryHeadStore {
  initHead(memoryId: string, ownerId: string): Promise<MemoryHeadRecord>;
  getHead(memoryId: string, ownerId: string): Promise<MemoryHeadRecord | null>;
  incrementHead(memoryId: string, ownerId: string): Promise<MemoryHeadRecord>;
}
