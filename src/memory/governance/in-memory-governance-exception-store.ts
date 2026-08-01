import {
  buildGovernanceExceptionRecord,
  type GovernanceExceptionAuditEntry,
  type GovernanceExceptionRecord,
  type GovernanceExceptionStatus,
  type NewGovernanceExceptionInput,
} from './governance-exception.types.js';
import type { IGovernanceExceptionStore } from './igovernance-exception-store.interface.js';

const DEFAULT_CAP = 100;

export class InMemoryGovernanceExceptionStore implements IGovernanceExceptionStore {
  private readonly records = new Map<string, GovernanceExceptionRecord[]>();

  constructor(private readonly cap: number = DEFAULT_CAP) {}

  async create(input: NewGovernanceExceptionInput): Promise<GovernanceExceptionRecord> {
    const record = buildGovernanceExceptionRecord(input);
    const history = this.records.get(input.ownerId) ?? [];
    history.unshift(record);
    this.records.set(input.ownerId, history.slice(0, this.cap));
    return record;
  }

  async list(ownerId: string, limit = this.cap): Promise<GovernanceExceptionRecord[]> {
    return (this.records.get(ownerId) ?? []).slice(0, limit);
  }

  async getById(ownerId: string, exceptionId: string): Promise<GovernanceExceptionRecord | null> {
    return (this.records.get(ownerId) ?? []).find((r) => r.exceptionId === exceptionId) ?? null;
  }

  async updateStatus(
    ownerId: string,
    exceptionId: string,
    status: GovernanceExceptionStatus,
    audit: GovernanceExceptionAuditEntry,
  ): Promise<GovernanceExceptionRecord | null> {
    const history = this.records.get(ownerId);
    if (!history) return null;
    const index = history.findIndex((r) => r.exceptionId === exceptionId);
    if (index < 0) return null;
    const updated: GovernanceExceptionRecord = {
      ...history[index]!,
      status,
      auditLog: [...history[index]!.auditLog, audit],
    };
    history[index] = updated;
    return updated;
  }
}
