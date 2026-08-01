import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import {
  buildPolicyDenialEvent,
  PolicyDenialEventSchema,
  type NewPolicyDenialInput,
  type PolicyDenialEvent,
} from '../../memory/governance/policy-denial.types.js';
import type { IPolicyDenialStore } from '../../memory/governance/ipolicy-denial-store.interface.js';

interface DenialRow {
  denial_id: string;
  owner_id: string;
  point: string;
  policy_module_id: string | null;
  reason_code: string;
  occurred_at: string;
  memory_id: string | null;
  resource: string | null;
}

const DEFAULT_LIMIT = 500;

function rowToEvent(row: DenialRow): PolicyDenialEvent {
  return PolicyDenialEventSchema.parse({
    denialId: row.denial_id,
    ownerId: row.owner_id,
    point: row.point,
    policyModuleId: row.policy_module_id ?? undefined,
    reasonCode: row.reason_code,
    occurredAt: row.occurred_at,
    memoryId: row.memory_id ?? undefined,
    resource: row.resource ?? undefined,
  });
}

export class SqlPolicyDenialStore implements IPolicyDenialStore {
  constructor(
    private readonly sql: ISqlDatabase,
    private readonly cap: number = DEFAULT_LIMIT,
  ) {}

  async append(event: PolicyDenialEvent): Promise<void> {
    await this.sql.execute(
      `INSERT INTO policy_denial_events
       (denial_id, owner_id, point, policy_module_id, reason_code, occurred_at, memory_id, resource)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.denialId,
        event.ownerId,
        event.point,
        event.policyModuleId ?? null,
        event.reasonCode,
        event.occurredAt,
        event.memoryId ?? null,
        event.resource ?? null,
      ],
    );
  }

  async record(input: NewPolicyDenialInput): Promise<void> {
    await this.append(buildPolicyDenialEvent(input));
  }

  async list(ownerId: string, limit = 100, since?: string): Promise<PolicyDenialEvent[]> {
    const effectiveLimit = Math.min(limit, this.cap);
    const rows = since
      ? await this.sql.query<DenialRow>(
          `SELECT denial_id, owner_id, point, policy_module_id, reason_code, occurred_at, memory_id, resource
           FROM policy_denial_events
           WHERE owner_id = ? AND occurred_at >= ?
           ORDER BY occurred_at DESC
           LIMIT ?`,
          [ownerId, since, effectiveLimit],
        )
      : await this.sql.query<DenialRow>(
          `SELECT denial_id, owner_id, point, policy_module_id, reason_code, occurred_at, memory_id, resource
           FROM policy_denial_events
           WHERE owner_id = ?
           ORDER BY occurred_at DESC
           LIMIT ?`,
          [ownerId, effectiveLimit],
        );
    return rows.map(rowToEvent);
  }

  async summarizeByPoint(ownerId: string, since?: string) {
    const rows = since
      ? await this.sql.query<{ point: string; count: number }>(
          `SELECT point, COUNT(*) as count FROM policy_denial_events
           WHERE owner_id = ? AND occurred_at >= ?
           GROUP BY point`,
          [ownerId, since],
        )
      : await this.sql.query<{ point: string; count: number }>(
          `SELECT point, COUNT(*) as count FROM policy_denial_events
           WHERE owner_id = ?
           GROUP BY point`,
          [ownerId],
        );

    const byPoint = { write: 0, recall: 0, stewardship: 0 } as Record<
      'write' | 'recall' | 'stewardship',
      number
    >;
    let total = 0;
    for (const row of rows) {
      if (row.point === 'write' || row.point === 'recall' || row.point === 'stewardship') {
        byPoint[row.point] = row.count;
        total += row.count;
      }
    }
    return {
      since: since ?? new Date(0).toISOString(),
      byPoint,
      total,
    };
  }
}
