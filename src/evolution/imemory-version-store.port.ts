import type { MemoryVersionRecord } from './memory-evolution.types.js';

export interface IMemoryVersionStore {
  appendVersion(
    record: Omit<MemoryVersionRecord, 'id' | 'createdAt'>,
  ): Promise<MemoryVersionRecord>;
  listVersions(memoryId: string, ownerId: string): Promise<MemoryVersionRecord[]>;
  getVersion(
    memoryId: string,
    ownerId: string,
    versionNumber: number,
  ): Promise<MemoryVersionRecord | null>;
}
