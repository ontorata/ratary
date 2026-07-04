import type { MemoryScope } from '../types/memory-scope.js';
import type { RetrievalWeightKey } from './ranking-policy-snapshot.js';

export type LearningEventType =
  | 'signal.explicit_feedback'
  | 'signal.access'
  | 'signal.consolidation_hint'
  | 'signal.inspection_outcome'
  | 'context.accessed'
  | 'learning.run.completed';

export interface LearningEvent {
  id: string;
  ownerId: string;
  workspaceId?: string;
  eventType: LearningEventType;
  payload: Record<string, unknown>;
  processed: boolean;
  createdAt: string;
}

export interface BehaviorAnalyticsSummary {
  totalEvents: number;
  unprocessedEvents: number;
  eventsByType: Record<string, number>;
  helpfulFeedbackCount: number;
  notHelpfulFeedbackCount: number;
}

export interface RankingPolicySnapshot {
  snapshotId: string;
  ownerId: string;
  workspaceId?: string;
  version: number;
  retrievalWeightMultipliers: Partial<Record<RetrievalWeightKey, number>>;
  createdAt: string;
}

export interface LearningRunOptions {
  dryRun: boolean;
  projectId?: string;
  limit?: number;
}

export interface LearningRunReport {
  ownerId: string;
  workspaceId?: string;
  dryRun: boolean;
  eventsProcessed: number;
  analytics: BehaviorAnalyticsSummary;
  rankingSnapshot?: RankingPolicySnapshot;
  recommendationsGenerated: number;
  patternsDiscovered: number;
}

export type LearningScope = MemoryScope;
