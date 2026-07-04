import type { Memory } from '../types/memory.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type { MemoryAccessAuditEntry } from '../ports/audit/imemory-access-auditor.port.js';
import type { IngestResult, MemoryQualitySignal } from '../ingest/memory-quality-signal.types.js';

export interface IDomainEventPublisher {
  publishMemoryCreated(scope: MemoryScope, memory: Memory): Promise<void>;
  publishMemoryUpdated(scope: MemoryScope, memory: Memory): Promise<void>;
  publishMemoryDeleted(scope: MemoryScope, memoryId: string): Promise<void>;
  publishMemoryAccessed(entry: MemoryAccessAuditEntry): Promise<void>;
  publishMemorySignalReceived(
    scope: MemoryScope,
    signal: MemoryQualitySignal,
    result: IngestResult,
  ): Promise<void>;
}
