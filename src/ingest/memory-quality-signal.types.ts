export type MemorySignalType = 'access' | 'explicit_feedback' | 'consolidation_hint' | 'ingest';

export interface MemoryQualitySignal {
  signalId: string;
  signalType: MemorySignalType;
  memoryId?: string;
  ownerId: string;
  workspaceId?: string;
  organizationId?: string;
  agentId?: string;
  deltaImportance?: number;
  payload?: Record<string, unknown>;
  observedAt: string;
}

export interface IngestResult {
  accepted: boolean;
  duplicate: boolean;
  appliedDelta?: number;
}

export interface ExplicitFeedbackPayload {
  type: 'explicit_feedback';
  memoryId: string;
  value: 'helpful' | 'not_helpful';
}
