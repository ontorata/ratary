import { NotFoundError } from '../../types/errors.js';
import type { IDisasterRecovery } from '../ports/idisaster-recovery.port.js';
import type {
  DrBackupSnapshot,
  DrFailoverInput,
  DrIntegrityReport,
  DrRestoreInput,
  DrScheduleRecord,
} from '../types/dr.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type { WorkspaceRegionAssignmentRef } from '../ports/idisaster-recovery.port.js';

/** No-op DR when DR_PLATFORM_ENABLED=false. */
export class NoOpDisasterRecovery implements IDisasterRecovery {
  async scheduleBackup(_input: {
    workspaceId: string;
    ownerId: string;
    cronExpression?: string;
  }): Promise<DrScheduleRecord> {
    throw new NotFoundError('DisasterRecovery', 'disabled');
  }

  async runScheduledBackup(_scheduleId: string, _scope: MemoryScope): Promise<DrBackupSnapshot> {
    throw new NotFoundError('DisasterRecovery', 'disabled');
  }

  async restore(_input: DrRestoreInput, _scope: MemoryScope): Promise<{ restored: number }> {
    throw new NotFoundError('DisasterRecovery', 'disabled');
  }

  async failover(_input: DrFailoverInput): Promise<WorkspaceRegionAssignmentRef> {
    throw new NotFoundError('DisasterRecovery', 'disabled');
  }

  async verifyIntegrity(_scope: MemoryScope): Promise<DrIntegrityReport> {
    throw new NotFoundError('DisasterRecovery', 'disabled');
  }

  async listSchedules(_ownerId: string, _workspaceId?: string): Promise<DrScheduleRecord[]> {
    return [];
  }
}
