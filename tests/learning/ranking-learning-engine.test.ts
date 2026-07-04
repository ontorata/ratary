import { describe, it, expect } from 'vitest';
import { DefaultRankingLearningEngine } from '../../src/learning/default-ranking-learning-engine.js';
import { LEARNING_MIN_FEEDBACK_EVENTS } from '../../src/learning/learning.constants.js';
import type { LearningEvent } from '../../src/learning/learning.types.js';

describe('DefaultRankingLearningEngine', () => {
  const engine = new DefaultRankingLearningEngine();
  const scope = { ownerId: 'owner-1' };

  function feedbackEvents(helpful: number, notHelpful: number): LearningEvent[] {
    const events: LearningEvent[] = [];
    for (let i = 0; i < helpful; i++) {
      events.push({
        id: `h-${i}`,
        ownerId: scope.ownerId,
        eventType: 'signal.explicit_feedback',
        payload: { value: 'helpful' },
        processed: false,
        createdAt: new Date().toISOString(),
      });
    }
    for (let i = 0; i < notHelpful; i++) {
      events.push({
        id: `n-${i}`,
        ownerId: scope.ownerId,
        eventType: 'signal.explicit_feedback',
        payload: { value: 'not_helpful' },
        processed: false,
        createdAt: new Date().toISOString(),
      });
    }
    return events;
  }

  it('returns null below minimum feedback threshold', () => {
    const snapshot = engine.compute(scope, feedbackEvents(1, 1));
    expect(snapshot).toBeNull();
    expect(LEARNING_MIN_FEEDBACK_EVENTS).toBeGreaterThan(2);
  });

  it('produces bounded access multiplier from helpful ratio', () => {
    const snapshot = engine.compute(scope, feedbackEvents(3, 0));
    expect(snapshot).not.toBeNull();
    expect(snapshot!.retrievalWeightMultipliers.accessCountLog).toBe(1.2);

    const mixed = engine.compute(scope, feedbackEvents(2, 2));
    expect(mixed!.retrievalWeightMultipliers.accessCountLog).toBe(1);
  });
});
