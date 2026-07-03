import type { AuditRepository } from '../../auth/audit.repository.js';
import type {
  IMemoryAccessAuditor,
  MemoryAccessAuditEntry,
} from '../../ports/audit/imemory-access-auditor.port.js';

export class AuditLogMemoryAccessAuditor implements IMemoryAccessAuditor {
  constructor(private readonly auditRepository: AuditRepository) {}

  async recordAccess(entry: MemoryAccessAuditEntry): Promise<void> {
    await this.auditRepository.append({
      event: 'memory.accessed',
      identityId: entry.identityId ?? null,
      ownerId: entry.ownerId,
      clientId: entry.clientId ?? null,
      resource: 'memory',
      resourceId: entry.memoryId,
      requestId: entry.requestId ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
      metadata: {
        source: entry.source,
        workspaceId: entry.workspaceId ?? null,
      },
    });
  }
}
