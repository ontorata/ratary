import type { MemoryVersionDiff } from './memory-evolution.types.js';

export interface IVersionConfidenceScorer {
  score(diff: MemoryVersionDiff): number;
}
