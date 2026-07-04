import type { ComplianceAuditEvent } from '../types/security.types.js';

export interface IComplianceAuditor {
  record(event: ComplianceAuditEvent): Promise<void>;
  exportEvents(organizationId: string, limit?: number): Promise<ComplianceAuditEvent[]>;
}
