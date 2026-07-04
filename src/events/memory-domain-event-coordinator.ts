import type { Memory } from '../types/memory.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type { IDomainEventPublisher } from './idomain-event-publisher.port.js';

export interface IMemoryDomainEventCoordinator {
  readonly enabled: boolean;
  onMemoryCreated(scope: MemoryScope, memory: Memory): Promise<void>;
  onMemoryUpdated(scope: MemoryScope, memory: Memory): Promise<void>;
  onMemoryDeleted(scope: MemoryScope, memoryId: string): Promise<void>;
}

export class MemoryDomainEventCoordinator implements IMemoryDomainEventCoordinator {
  readonly enabled = true;

  constructor(private readonly publisher: IDomainEventPublisher) {}

  async onMemoryCreated(scope: MemoryScope, memory: Memory): Promise<void> {
    await this.publisher.publishMemoryCreated(scope, memory);
  }

  async onMemoryUpdated(scope: MemoryScope, memory: Memory): Promise<void> {
    await this.publisher.publishMemoryUpdated(scope, memory);
  }

  async onMemoryDeleted(scope: MemoryScope, memoryId: string): Promise<void> {
    await this.publisher.publishMemoryDeleted(scope, memoryId);
  }
}

export class NoOpMemoryDomainEventCoordinator implements IMemoryDomainEventCoordinator {
  readonly enabled = false;

  async onMemoryCreated(_scope: MemoryScope, _memory: Memory): Promise<void> {}

  async onMemoryUpdated(_scope: MemoryScope, _memory: Memory): Promise<void> {}

  async onMemoryDeleted(_scope: MemoryScope, _memoryId: string): Promise<void> {}
}
