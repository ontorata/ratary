import type { IEventBus } from '../ports/events/ievent-bus.port.js';
import type { Memory } from '../types/memory.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type { MemoryAccessAuditEntry } from '../ports/audit/imemory-access-auditor.port.js';
import { workspaceIdFromScope } from '../repositories/repository-scope.js';
import { DomainEventTopics } from './domain-event-topics.js';
import type { IDomainEventPublisher } from './idomain-event-publisher.port.js';

export class DomainEventPublisher implements IDomainEventPublisher {
  constructor(private readonly eventBus: IEventBus) {}

  async publishMemoryCreated(scope: MemoryScope, memory: Memory): Promise<void> {
    await this.safePublish(DomainEventTopics.MEMORY_CREATED, {
      memoryId: memory.id,
      ownerId: scope.ownerId,
      workspaceId: workspaceIdFromScope(scope) ?? null,
      project: memory.project ?? null,
    });
  }

  async publishMemoryUpdated(scope: MemoryScope, memory: Memory): Promise<void> {
    await this.safePublish(DomainEventTopics.MEMORY_UPDATED, {
      memoryId: memory.id,
      ownerId: scope.ownerId,
      workspaceId: workspaceIdFromScope(scope) ?? null,
      project: memory.project ?? null,
    });
  }

  async publishMemoryDeleted(scope: MemoryScope, memoryId: string): Promise<void> {
    await this.safePublish(DomainEventTopics.MEMORY_DELETED, {
      memoryId,
      ownerId: scope.ownerId,
      workspaceId: workspaceIdFromScope(scope) ?? null,
    });
  }

  async publishMemoryAccessed(entry: MemoryAccessAuditEntry): Promise<void> {
    await this.safePublish(
      DomainEventTopics.MEMORY_ACCESSED,
      {
        memoryId: entry.memoryId,
        ownerId: entry.ownerId,
        workspaceId: entry.workspaceId ?? null,
        source: entry.source,
        identityId: entry.identityId,
        clientId: entry.clientId,
        requestId: entry.requestId,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
      entry.requestId,
    );
  }

  private async safePublish<T>(
    topic: string,
    payload: T,
    correlationId?: string,
  ): Promise<void> {
    try {
      await this.eventBus.publish(topic, payload, {
        correlationId: correlationId ?? crypto.randomUUID(),
      });
    } catch {
      // Fire-and-forget: domain CRUD must not fail when the bus is unavailable.
    }
  }
}
