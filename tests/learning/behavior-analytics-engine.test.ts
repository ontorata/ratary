import { describe, it, expect } from 'vitest';
import { DefaultBehaviorAnalyticsEngine } from '../../src/learning/default-behavior-analytics-engine.js';
import type { LearningEvent } from '../../src/learning/learning.types.js';

describe('DefaultBehaviorAnalyticsEngine', () => {
  const engine = new DefaultBehaviorAnalyticsEngine();

  it('summarizes feedback counts by type', () => {
    const events: LearningEvent[] = [
      {
        id: '1',
        ownerId: 'o1',
        eventType: 'signal.explicit_feedback',
        payload: { value: 'helpful' },
        processed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        ownerId: 'o1',
        eventType: 'signal.explicit_feedback',
        payload: { value: 'not_helpful' },
        processed: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const summary = engine.summarize(events);
    expect(summary.totalEvents).toBe(2);
    expect(summary.helpfulFeedbackCount).toBe(1);
    expect(summary.notHelpfulFeedbackCount).toBe(1);
  });
});
