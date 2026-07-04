import type { BehaviorAnalyticsSummary, LearningEvent } from './learning.types.js';

export interface IBehaviorAnalyticsEngine {
  summarize(events: readonly LearningEvent[]): BehaviorAnalyticsSummary;
}
