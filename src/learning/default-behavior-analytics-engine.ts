import type { LearningEvent, BehaviorAnalyticsSummary } from './learning.types.js';
import type { IBehaviorAnalyticsEngine } from './ibehavior-analytics-engine.interface.js';

export class DefaultBehaviorAnalyticsEngine implements IBehaviorAnalyticsEngine {
  summarize(events: readonly LearningEvent[]): BehaviorAnalyticsSummary {
    const eventsByType: Record<string, number> = {};
    let helpfulFeedbackCount = 0;
    let notHelpfulFeedbackCount = 0;
    let unprocessedEvents = 0;

    for (const event of events) {
      eventsByType[event.eventType] = (eventsByType[event.eventType] ?? 0) + 1;
      if (!event.processed) {
        unprocessedEvents++;
      }
      if (event.eventType === 'signal.explicit_feedback') {
        const value = event.payload.value;
        if (value === 'helpful') helpfulFeedbackCount++;
        if (value === 'not_helpful') notHelpfulFeedbackCount++;
      }
    }

    return {
      totalEvents: events.length,
      unprocessedEvents,
      eventsByType,
      helpfulFeedbackCount,
      notHelpfulFeedbackCount,
    };
  }
}
