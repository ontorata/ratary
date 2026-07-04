export interface DrScheduleRecord {
  id: string;
  workspaceId: string;
  ownerId: string;
  cronExpression?: string;
  enabled: boolean;
  lastRunAt?: string;
  createdAt: string;
}

export interface DrBackupSnapshot {
  scheduleId: string;
  workspaceId: string;
  ownerId: string;
  memoryCount: number;
  capturedAt: string;
  payload: unknown;
}

export interface DrRestoreInput {
  workspaceId: string;
  ownerId: string;
  snapshotId?: string;
  payload?: unknown;
}

export interface DrFailoverInput {
  workspaceId: string;
  ownerId: string;
  promoteSecondary: boolean;
}

export interface DrIntegrityReport {
  workspaceId: string;
  ownerId: string;
  verified: boolean;
  memoryCount: number;
  checkedAt: string;
  notes?: string;
}
