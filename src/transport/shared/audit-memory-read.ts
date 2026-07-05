import type { IMemoryAccessAuditor } from '../../ports/audit/imemory-access-auditor.port.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import { workspaceIdFromScope } from '../../repositories/repository-scope.js';
import type { TransportContext } from './transport-context.types.js';

/** Phase 12C / T-07 — audit GET memory reads when MEMORY_ACCESS_AUDIT=true. */
export async function auditMemoryRead(
  auditor: IMemoryAccessAuditor | undefined,
  ctx: TransportContext,
  scope: MemoryScope,
  memoryId: string,
): Promise<void> {
  if (!auditor) return;

  await auditor.recordAccess({
    memoryId,
    ownerId: scope.ownerId,
    workspaceId: workspaceIdFromScope(scope),
    source: 'memory.read',
    identityId: ctx.auth?.identityId ?? ctx.auditIdentityId,
    ipAddress: ctx.clientIp,
  });
}
