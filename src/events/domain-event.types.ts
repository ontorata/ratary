import type { MemoryAccessSource } from '../ports/audit/imemory-access-auditor.port.js';

export interface MemoryCreatedEventPayload {
  memoryId: string;
  ownerId: string;
  workspaceId?: string | null;
  project?: string | null;
}

export interface MemoryUpdatedEventPayload {
  memoryId: string;
  ownerId: string;
  workspaceId?: string | null;
  project?: string | null;
}

export interface MemoryDeletedEventPayload {
  memoryId: string;
  ownerId: string;
  workspaceId?: string | null;
}

export interface MemoryAccessedEventPayload {
  memoryId: string;
  ownerId: string;
  workspaceId?: string | null;
  source: MemoryAccessSource;
  identityId?: string;
  clientId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface MemorySignalReceivedEventPayload {
  signalId: string;
  memoryId?: string;
  ownerId: string;
  workspaceId?: string | null;
  signalType: string;
}
