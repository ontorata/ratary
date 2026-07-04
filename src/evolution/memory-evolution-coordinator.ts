import type { Memory } from '../types/memory.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type { IMemoryVersionStore } from './imemory-version-store.port.js';
import type { IMemoryHeadStore } from './imemory-head-store.port.js';
import { toMemorySnapshot } from './memory-evolution.types.js';

export interface IMemoryEvolutionCoordinator {
  readonly enabled: boolean;
  onMemoryCreated(scope: MemoryScope, memory: Memory): Promise<void>;
  onMemoryUpdated(scope: MemoryScope, before: Memory, createdBy?: string | null): Promise<void>;
}

export class MemoryEvolutionCoordinator implements IMemoryEvolutionCoordinator {
  readonly enabled = true;

  constructor(
    private readonly versionStore: IMemoryVersionStore,
    private readonly headStore: IMemoryHeadStore,
  ) {}

  async onMemoryCreated(scope: MemoryScope, memory: Memory): Promise<void> {
    await this.headStore.initHead(memory.id, scope.ownerId);
  }

  async onMemoryUpdated(
    scope: MemoryScope,
    before: Memory,
    createdBy: string | null = null,
  ): Promise<void> {
    let head = await this.headStore.getHead(before.id, scope.ownerId);
    if (!head) {
      head = await this.headStore.initHead(before.id, scope.ownerId);
    }

    const nextVersion = head.currentVersion + 1;
    const snapshot = toMemorySnapshot(before);

    await this.versionStore.appendVersion({
      memoryId: before.id,
      ownerId: scope.ownerId,
      versionNumber: nextVersion,
      snapshot,
      createdBy,
      mergeParentIds: [],
      confidence: 1,
    });

    await this.headStore.incrementHead(before.id, scope.ownerId);
  }
}

export class NoOpMemoryEvolutionCoordinator implements IMemoryEvolutionCoordinator {
  readonly enabled = false;

  async onMemoryCreated(_scope: MemoryScope, _memory: Memory): Promise<void> {}

  async onMemoryUpdated(
    _scope: MemoryScope,
    _before: Memory,
    _createdBy?: string | null,
  ): Promise<void> {}
}
