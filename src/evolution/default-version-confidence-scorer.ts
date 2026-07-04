import type { IVersionConfidenceScorer } from './iversion-confidence-scorer.interface.js';
import type { MemoryVersionDiff } from './memory-evolution.types.js';

export class DefaultVersionConfidenceScorer implements IVersionConfidenceScorer {
  score(diff: MemoryVersionDiff): number {
    if (diff.changes.length === 0) {
      return 1;
    }
    const weighted = diff.changes.reduce((sum, change) => {
      if (change.field === 'content' || change.field === 'summary') return sum + 0.3;
      if (change.field === 'title') return sum + 0.2;
      return sum + 0.1;
    }, 0);
    return Math.min(1, Math.max(0.1, weighted));
  }
}
