import type {
  GovernanceExceptionAuditEntry,
  GovernanceExceptionRecord,
  GovernanceExceptionStatus,
  NewGovernanceExceptionInput,
} from './governance-exception.types.js';

export interface IGovernanceExceptionStore {
  create(input: NewGovernanceExceptionInput): Promise<GovernanceExceptionRecord>;
  list(ownerId: string, limit?: number): Promise<GovernanceExceptionRecord[]>;
  getById(ownerId: string, exceptionId: string): Promise<GovernanceExceptionRecord | null>;
  updateStatus(
    ownerId: string,
    exceptionId: string,
    status: GovernanceExceptionStatus,
    audit: GovernanceExceptionAuditEntry,
  ): Promise<GovernanceExceptionRecord | null>;
}
