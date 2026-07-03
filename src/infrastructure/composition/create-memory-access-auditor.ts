import type { Env } from '../../config/env.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IMemoryAccessAuditor } from '../../ports/audit/imemory-access-auditor.port.js';
import { AuditRepository } from '../../auth/audit.repository.js';
import { NoOpMemoryAccessAuditor } from '../audit/noop-memory-access-auditor.js';
import { AuditLogMemoryAccessAuditor } from '../audit/audit-log-memory-access-auditor.js';

export function createMemoryAccessAuditor(env: Env, sql: ISqlDatabase): IMemoryAccessAuditor {
  if (!env.MEMORY_ACCESS_AUDIT) {
    return new NoOpMemoryAccessAuditor();
  }

  return new AuditLogMemoryAccessAuditor(new AuditRepository(sql));
}
