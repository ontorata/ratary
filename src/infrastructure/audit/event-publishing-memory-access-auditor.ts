import type {
  IMemoryAccessAuditor,
  MemoryAccessAuditEntry,
} from '../../ports/audit/imemory-access-auditor.port.js';
import type { IDomainEventPublisher } from '../../events/idomain-event-publisher.port.js';

/**
 * Decorator that publishes memory.accessed domain events after the inner auditor runs.
 * Phase 12 — async fan-out without changing ContextService contracts.
 */
export class EventPublishingMemoryAccessAuditor implements IMemoryAccessAuditor {
  constructor(
    private readonly inner: IMemoryAccessAuditor,
    private readonly publisher: IDomainEventPublisher,
  ) {}

  async recordAccess(entry: MemoryAccessAuditEntry): Promise<void> {
    await this.inner.recordAccess(entry);
    void this.publisher.publishMemoryAccessed(entry);
  }
}
