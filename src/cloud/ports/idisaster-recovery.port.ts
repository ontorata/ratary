import type {
  DrBackupSnapshot,
  DrFailoverInput,
  DrIntegrityReport,
  DrRestoreInput,
  DrScheduleRecord,
} from '../types/dr.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';

export type BackupExportFn = (scope: MemoryScope) => Promise<{ memories: unknown[] }>;

/** DR orchestration wrapping existing backup flows (ADR-033). */
export interface IDisasterRecovery {
  scheduleBackup(input: {
    workspaceId: string;
    ownerId: string;
    cronExpression?: string;
  }): Promise<DrScheduleRecord>;
  runScheduledBackup(scheduleId: string, scope: MemoryScope): Promise<DrBackupSnapshot>;
  restore(input: DrRestoreInput, scope: MemoryScope): Promise<{ restored: number }>;
  failover(input: DrFailoverInput): Promise<WorkspaceRegionAssignmentRef>;
  verifyIntegrity(scope: MemoryScope): Promise<DrIntegrityReport>;
  listSchedules(ownerId: string, workspaceId?: string): Promise<DrScheduleRecord[]>;
}

export interface WorkspaceRegionAssignmentRef {
  workspaceId: string;
  primaryRegionId: string;
  secondaryRegionId?: string;
}
