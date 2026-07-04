import type { RelationType } from '../types/knowledge.js';
import type { MemoryScope } from '../types/memory-scope.js';

export type InferenceSourceId =
  | 'project'
  | 'shared_tag'
  | 'temporal'
  | 'conversation'
  | 'dependency'
  | 'semantic_similarity';

export interface InferredRelationCandidate {
  sourceMemoryId: string;
  targetMemoryId: string;
  relation: RelationType;
  weight: number;
  confidence: number;
  inferenceSource: InferenceSourceId;
  evidence: Record<string, unknown>;
}

export interface ScoredInferredRelation extends InferredRelationCandidate {
  finalWeight: number;
  finalConfidence: number;
}

export interface RelationInferenceRunOptions {
  dryRun: boolean;
  projectId?: string;
  limit?: number;
}

export interface RelationInferenceRunReport {
  ownerId: string;
  workspaceId?: string;
  dryRun: boolean;
  candidatesFound: number;
  relationsCreated: number;
  relationsUpdated: number;
  relationsSkippedManual: number;
  bySource: Record<string, number>;
}

export type RelationInferenceScope = MemoryScope;
