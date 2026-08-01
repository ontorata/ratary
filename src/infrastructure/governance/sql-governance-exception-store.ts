import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import {
  buildGovernanceExceptionRecord,
  GovernanceExceptionRecordSchema,
  type GovernanceExceptionAuditEntry,
  type GovernanceExceptionRecord,
  type GovernanceExceptionStatus,
  type NewGovernanceExceptionInput,
} from '../../memory/governance/governance-exception.types.js';
import type { IGovernanceExceptionStore } from '../../memory/governance/igovernance-exception-store.interface.js';

interface ExceptionRow {
  exception_id: string;
  owner_id: string;
  exception_class: string;
  rationale: string;
  status: string;
  requested_by: string;
  requested_at: string;
  expires_at: string | null;
  audit_json: string;
}

const DEFAULT_LIMIT = 100;

function rowToRecord(row: ExceptionRow): GovernanceExceptionRecord {
  return GovernanceExceptionRecordSchema.parse({
    exceptionId: row.exception_id,
    ownerId: row.owner_id,
    exceptionClass: row.exception_class,
    rationale: row.rationale,
    status: row.status,
    requestedBy: row.requested_by,
    requestedAt: row.requested_at,
    expiresAt: row.expires_at ?? undefined,
    auditLog: JSON.parse(row.audit_json),
  });
}

/** SQL-backed governance exception requests (PI-1027-B). */
export class SqlGovernanceExceptionStore implements IGovernanceExceptionStore {
  constructor(
    private readonly sql: ISqlDatabase,
    private readonly cap: number = DEFAULT_LIMIT,
  ) {}

  async create(input: NewGovernanceExceptionInput): Promise<GovernanceExceptionRecord> {
    const record = buildGovernanceExceptionRecord(input);
    await this.sql.execute(
      `INSERT INTO governance_exceptions
       (exception_id, owner_id, exception_class, rationale, status, requested_by, requested_at, expires_at, audit_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.exceptionId,
        record.ownerId,
        record.exceptionClass,
        record.rationale,
        record.status,
        record.requestedBy,
        record.requestedAt,
        record.expiresAt ?? null,
        JSON.stringify(record.auditLog),
      ],
    );
    return record;
  }

  async list(ownerId: string, limit = this.cap): Promise<GovernanceExceptionRecord[]> {
    const rows = await this.sql.query<ExceptionRow>(
      `SELECT exception_id, owner_id, exception_class, rationale, status, requested_by, requested_at, expires_at, audit_json
       FROM governance_exceptions
       WHERE owner_id = ?
       ORDER BY requested_at DESC
       LIMIT ?`,
      [ownerId, limit],
    );
    return rows.map(rowToRecord);
  }

  async getById(ownerId: string, exceptionId: string): Promise<GovernanceExceptionRecord | null> {
    const rows = await this.sql.query<ExceptionRow>(
      `SELECT exception_id, owner_id, exception_class, rationale, status, requested_by, requested_at, expires_at, audit_json
       FROM governance_exceptions
       WHERE owner_id = ? AND exception_id = ?
       LIMIT 1`,
      [ownerId, exceptionId],
    );
    const row = rows[0];
    return row ? rowToRecord(row) : null;
  }

  async updateStatus(
    ownerId: string,
    exceptionId: string,
    status: GovernanceExceptionStatus,
    audit: GovernanceExceptionAuditEntry,
  ): Promise<GovernanceExceptionRecord | null> {
    const existing = await this.getById(ownerId, exceptionId);
    if (!existing) return null;
    const auditLog = [...existing.auditLog, audit];
    await this.sql.execute(
      `UPDATE governance_exceptions
       SET status = ?, audit_json = ?
       WHERE owner_id = ? AND exception_id = ?`,
      [status, JSON.stringify(auditLog), ownerId, exceptionId],
    );
    return { ...existing, status, auditLog };
  }
}
