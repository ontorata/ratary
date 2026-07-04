import type { LearningEvent, LearningScope } from './learning.types.js';

export interface ILearningEventStore {
  append(event: Omit<LearningEvent, 'processed'>): Promise<void>;
  listUnprocessed(scope: LearningScope, limit: number): Promise<LearningEvent[]>;
  markProcessed(eventIds: string[]): Promise<void>;
}
