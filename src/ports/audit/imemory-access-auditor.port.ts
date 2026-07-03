export type MemoryAccessSource = 'context.build';

export interface MemoryAccessAuditEntry {
  memoryId: string;
  ownerId: string;
  workspaceId?: string;
  source: MemoryAccessSource;
  identityId?: string;
  clientId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface IMemoryAccessAuditor {
  recordAccess(entry: MemoryAccessAuditEntry): Promise<void>;
}
