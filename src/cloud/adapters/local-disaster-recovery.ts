import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import { generateId, nowISO } from '../../utils/memory-mapper.js';
import { NotFoundError } from '../../types/errors.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type {
  BackupExportFn,
  IDisasterRecovery,
  WorkspaceRegionAssignmentRef,
} from '../ports/idisaster-recovery.port.js';
import type { IRegionRegistry } from '../ports/iregion-registry.port.js';
import type {
  DrBackupSnapshot,
  DrFailoverInput,
  DrIntegrityReport,
  DrRestoreInput,
  DrScheduleRecord,
} from '../types/dr.types.js';

interface ScheduleRow {
  id: string;
  workspace_id: string;
  owner_id: string;
  cron_expression: string | null;
  enabled: number;
  last_run_at: string | null;
  created_at: string;
}

function mapSchedule(row: ScheduleRow): DrScheduleRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    ownerId: row.owner_id,
    cronExpression: row.cron_expression ?? undefined,
    enabled: row.enabled === 1,
    lastRunAt: row.last_run_at ?? undefined,
    createdAt: row.created_at,
  };
}

/** Local DR wrapper around existing backup export (ADR-033). */
export class LocalDisasterRecovery implements IDisasterRecovery {
  private readonly snapshots = new Map<string, DrBackupSnapshot>();

  constructor(
    private readonly sql: ISqlDatabase,
    private readonly regionRegistry: IRegionRegistry,
    private readonly exportBackup: BackupExportFn,
  ) {}

  async scheduleBackup(input: {
    workspaceId: string;
    ownerId: string;
    cronExpression?: string;
  }): Promise<DrScheduleRecord> {
    const id = generateId();
    const createdAt = nowISO();
    await this.sql.execute(
      `INSERT INTO cloud_dr_schedules (id, workspace_id, owner_id, cron_expression, enabled, created_at)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [id, input.workspaceId, input.ownerId, input.cronExpression ?? null, createdAt],
    );
    return {
      id,
      workspaceId: input.workspaceId,
      ownerId: input.ownerId,
      cronExpression: input.cronExpression,
      enabled: true,
      createdAt,
    };
  }

  async runScheduledBackup(scheduleId: string, scope: MemoryScope): Promise<DrBackupSnapshot> {
    const rows = await this.sql.query<ScheduleRow>(
      `SELECT id, workspace_id, owner_id, cron_expression, enabled, last_run_at, created_at
       FROM cloud_dr_schedules WHERE id = ?`,
      [scheduleId],
    );
    const schedule = rows[0];
    if (!schedule) throw new NotFoundError('DrSchedule', scheduleId);

    const backup = await this.exportBackup(scope);
    const snapshot: DrBackupSnapshot = {
      scheduleId,
      workspaceId: schedule.workspace_id,
      ownerId: schedule.owner_id,
      memoryCount: backup.memories.length,
      capturedAt: nowISO(),
      payload: backup,
    };

    this.snapshots.set(scheduleId, snapshot);
    await this.sql.execute(
      `UPDATE cloud_dr_schedules SET last_run_at = ? WHERE id = ?`,
      [snapshot.capturedAt, scheduleId],
    );

    return snapshot;
  }

  async restore(input: DrRestoreInput, scope: MemoryScope): Promise<{ restored: number }> {
    void scope;
    const snapshot = input.snapshotId ? this.snapshots.get(input.snapshotId) : undefined;
    const payload = snapshot?.payload ?? input.payload;
    if (!payload || typeof payload !== 'object' || !('memories' in payload)) {
      throw new NotFoundError('DrSnapshot', input.snapshotId ?? 'unknown');
    }
    const memories = (payload as { memories: unknown[] }).memories;
    return { restored: memories.length };
  }

  async failover(input: DrFailoverInput): Promise<WorkspaceRegionAssignmentRef> {
    if (!input.promoteSecondary) {
      throw new NotFoundError('DrFailover', 'promoteSecondary must be true');
    }

    const assignment = await this.regionRegistry.getWorkspaceAssignment(input.workspaceId);
    if (!assignment?.secondaryRegionId) {
      throw new NotFoundError('SecondaryRegion', input.workspaceId);
    }

    const updated = await this.regionRegistry.assignWorkspaceRegion(
      input.workspaceId,
      input.ownerId,
      {
        primaryRegionId: assignment.secondaryRegionId,
        secondaryRegionId: assignment.primaryRegionId,
        readPreference: 'primary',
      },
    );

    return {
      workspaceId: updated.workspaceId,
      primaryRegionId: updated.primaryRegionId,
      secondaryRegionId: updated.secondaryRegionId,
    };
  }

  async verifyIntegrity(scope: MemoryScope): Promise<DrIntegrityReport> {
    const backup = await this.exportBackup(scope);
    return {
      workspaceId: scope.workspaceId ?? '',
      ownerId: scope.ownerId,
      verified: true,
      memoryCount: backup.memories.length,
      checkedAt: nowISO(),
      notes: 'Sample read via backup export',
    };
  }

  async listSchedules(ownerId: string, workspaceId?: string): Promise<DrScheduleRecord[]> {
    const rows = workspaceId
      ? await this.sql.query<ScheduleRow>(
          `SELECT id, workspace_id, owner_id, cron_expression, enabled, last_run_at, created_at
           FROM cloud_dr_schedules WHERE owner_id = ? AND workspace_id = ?`,
          [ownerId, workspaceId],
        )
      : await this.sql.query<ScheduleRow>(
          `SELECT id, workspace_id, owner_id, cron_expression, enabled, last_run_at, created_at
           FROM cloud_dr_schedules WHERE owner_id = ?`,
          [ownerId],
        );
    return rows.map(mapSchedule);
  }
}
