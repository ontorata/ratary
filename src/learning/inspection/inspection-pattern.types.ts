import type { InspectionOutcomeCategory } from '../../ingest/memory-quality-signal.types.js';

export type InspectionPatternScope = 'workspace' | 'project' | 'organization';

export type InspectionPatternLifecycle = 'active' | 'aging' | 'low' | 'archived';

export interface InspectionPatternTrigger {
  paths?: string[];
  modules?: string[];
  adrIds?: string[];
}

export interface InspectionPattern {
  id: string;
  ownerId: string;
  workspaceId?: string;
  organizationId?: string;
  memoryId?: string;
  patternKey: string;
  patternScope: InspectionPatternScope;
  category: InspectionOutcomeCategory;
  trigger: InspectionPatternTrigger;
  description: string;
  confidence: number;
  evidenceCount: number;
  protected: boolean;
  disabled: boolean;
  lifecycleState: InspectionPatternLifecycle;
  lastConfirmedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionPatternCandidate {
  patternKey: string;
  category: InspectionOutcomeCategory;
  trigger: InspectionPatternTrigger;
  description: string;
  evidenceCount: number;
  signalIds: string[];
}

export interface InspectionPatternContradiction {
  id: string;
  ownerId: string;
  patternIdA: string;
  patternIdB: string;
  reason: string;
  detectedAt: string;
}

export interface InspectionLedgerRunOptions {
  dryRun: boolean;
  projectId?: string;
  limit?: number;
}

export interface InspectionLedgerRunReport {
  ownerId: string;
  workspaceId?: string;
  dryRun: boolean;
  eventsScanned: number;
  patternsUpserted: number;
  contradictionsFound: number;
  charterPromoted: number;
  confidenceRefreshed: number;
}
