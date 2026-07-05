import type { BuildContextRequest } from '../../memory/context.service.js';
import type { TransportContext } from './transport-context.types.js';

/** Phase 12C — identity/IP from transport edge into context.build audit (D12-01). */
export function buildContextAuditFields(
  ctx: TransportContext,
): Pick<BuildContextRequest, 'auditIdentityId' | 'auditIpAddress'> {
  return {
    auditIdentityId: ctx.auth?.identityId ?? ctx.auditIdentityId,
    auditIpAddress: ctx.clientIp,
  };
}
