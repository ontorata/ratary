import { describe, it, expect, beforeEach } from 'vitest';
import { AuditLogMemoryAccessAuditor } from '../../src/infrastructure/audit/audit-log-memory-access-auditor.js';
import { NoOpMemoryAccessAuditor } from '../../src/infrastructure/audit/noop-memory-access-auditor.js';
import { createMemoryAccessAuditor } from '../../src/infrastructure/composition/create-memory-access-auditor.js';
import type { AuditLogInput } from '../../src/auth/audit.repository.js';
import { AuditRepository } from '../../src/auth/audit.repository.js';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import { MockD1Client } from '../helpers/mock-d1.js';

class RecordingAuditRepository extends AuditRepository {
  readonly entries: AuditLogInput[] = [];

  override async append(input: AuditLogInput): Promise<void> {
    this.entries.push(input);
  }
}

describe('Memory access auditor', () => {
  let db: ReturnType<typeof asSqlDatabase>;
  let audit: RecordingAuditRepository;

  beforeEach(() => {
    db = asSqlDatabase(new MockD1Client());
    audit = new RecordingAuditRepository(db);
  });

  it('NoOpMemoryAccessAuditor does not throw', async () => {
    const auditor = new NoOpMemoryAccessAuditor();
    await expect(
      auditor.recordAccess({
        memoryId: 'mem-1',
        ownerId: 'owner-1',
        source: 'context.build',
      }),
    ).resolves.toBeUndefined();
  });

  it('AuditLogMemoryAccessAuditor appends memory.accessed', async () => {
    const auditor = new AuditLogMemoryAccessAuditor(audit);

    await auditor.recordAccess({
      memoryId: 'mem-abc',
      ownerId: 'owner-xyz',
      workspaceId: 'ws-1',
      source: 'context.build',
      identityId: 'id-1',
      requestId: 'req-1',
    });

    expect(audit.entries).toHaveLength(1);
    expect(audit.entries[0]).toMatchObject({
      event: 'memory.accessed',
      ownerId: 'owner-xyz',
      resource: 'memory',
      resourceId: 'mem-abc',
      identityId: 'id-1',
      requestId: 'req-1',
      metadata: {
        source: 'context.build',
        workspaceId: 'ws-1',
      },
    });
  });

  it('createMemoryAccessAuditor returns NoOp when MEMORY_ACCESS_AUDIT=false', () => {
    const auditor = createMemoryAccessAuditor({ MEMORY_ACCESS_AUDIT: false } as never, db);
    expect(auditor).toBeInstanceOf(NoOpMemoryAccessAuditor);
  });

  it('createMemoryAccessAuditor returns AuditLog when MEMORY_ACCESS_AUDIT=true', () => {
    const auditor = createMemoryAccessAuditor({ MEMORY_ACCESS_AUDIT: true } as never, db);
    expect(auditor).toBeInstanceOf(AuditLogMemoryAccessAuditor);
  });
});
