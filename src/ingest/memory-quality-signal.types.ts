export type MemorySignalType =
  'access' | 'explicit_feedback' | 'consolidation_hint' | 'ingest' | 'inspection_outcome';

export type InspectionOutcomeSource = 'forge_inspect' | 'ci' | 'mcp' | 'rest';

export type InspectionOutcomeSeverity = 'constitutional' | 'critical' | 'major';

export type InspectionOutcomeCategory = 'boundary' | 'adr' | 'testing' | 'security' | 'phase_gate';

export interface InspectionDiffScope {
  paths?: string[];
  modules?: string[];
  adrIds?: string[];
}

export interface InspectionOutcomePayload {
  kind: 'inspection_outcome';
  source: InspectionOutcomeSource;
  taskId?: string;
  severity: InspectionOutcomeSeverity;
  category: InspectionOutcomeCategory;
  resolved: boolean;
  diffScope?: InspectionDiffScope;
  patternHint?: string;
}

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
