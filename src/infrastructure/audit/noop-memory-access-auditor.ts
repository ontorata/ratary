import type {
  IMemoryAccessAuditor,
  MemoryAccessAuditEntry,
} from '../../ports/audit/imemory-access-auditor.port.js';

export class NoOpMemoryAccessAuditor implements IMemoryAccessAuditor {
  async recordAccess(_entry: MemoryAccessAuditEntry): Promise<void> {
    // default — no audit trail
  }
}
