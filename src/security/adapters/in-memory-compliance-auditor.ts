import type { IComplianceAuditor } from '../ports/icompliance-auditor.port.js';
import type { ComplianceAuditEvent } from '../types/security.types.js';

export class InMemoryComplianceAuditor implements IComplianceAuditor {
  private readonly events: ComplianceAuditEvent[] = [];

  async record(event: ComplianceAuditEvent): Promise<void> {
    this.events.push(event);
    if (this.events.length > 10_000) {
      this.events.splice(0, this.events.length - 10_000);
    }
  }

  async exportEvents(organizationId: string, limit = 100): Promise<ComplianceAuditEvent[]> {
    return this.events
      .filter((e) => !organizationId || e.organizationId === organizationId)
      .slice(-limit);
  }
}
