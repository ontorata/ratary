import type { ILearningOrchestrator } from './ilearning-orchestrator.interface.js';
import type { LearningRunOptions, LearningRunReport, LearningScope } from './learning.types.js';

export class NoOpLearningOrchestrator implements ILearningOrchestrator {
  async run(scope: LearningScope, options: LearningRunOptions): Promise<LearningRunReport> {
    return {
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      dryRun: options.dryRun,
      eventsProcessed: 0,
      analytics: {
        totalEvents: 0,
        unprocessedEvents: 0,
        eventsByType: {},
        helpfulFeedbackCount: 0,
        notHelpfulFeedbackCount: 0,
      },
      recommendationsGenerated: 0,
      patternsDiscovered: 0,
    };
  }
}
