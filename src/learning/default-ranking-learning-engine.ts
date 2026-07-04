import {
  LEARNING_MIN_FEEDBACK_EVENTS,
  LEARNING_WEIGHT_MULTIPLIER_MAX,
  LEARNING_WEIGHT_MULTIPLIER_MIN,
} from './learning.constants.js';
import type { IRankingLearningEngine } from './iranking-learning-engine.interface.js';
import type { LearningEvent, LearningScope, RankingPolicySnapshot } from './learning.types.js';
import { clampMultiplier } from './ranking-policy-snapshot.js';

export class DefaultRankingLearningEngine implements IRankingLearningEngine {
  compute(scope: LearningScope, events: readonly LearningEvent[]): RankingPolicySnapshot | null {
    const feedback = events.filter((event) => event.eventType === 'signal.explicit_feedback');
    if (feedback.length < LEARNING_MIN_FEEDBACK_EVENTS) {
      return null;
    }

    let helpful = 0;
    let notHelpful = 0;
    for (const event of feedback) {
      const value = event.payload.value;
      if (value === 'helpful') helpful++;
      if (value === 'not_helpful') notHelpful++;
    }

    const total = helpful + notHelpful;
    if (total === 0) {
      return null;
    }

    const helpfulRatio = helpful / total;
    const accessMultiplier = clampMultiplier(
      LEARNING_WEIGHT_MULTIPLIER_MIN +
        helpfulRatio * (LEARNING_WEIGHT_MULTIPLIER_MAX - LEARNING_WEIGHT_MULTIPLIER_MIN),
    );

    return {
      snapshotId: crypto.randomUUID(),
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      version: 1,
      retrievalWeightMultipliers: { accessCountLog: accessMultiplier },
      createdAt: new Date().toISOString(),
    };
  }
}
