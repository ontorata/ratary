import type { ILearningOrchestrator } from '../../../learning/ilearning-orchestrator.interface.js';
import type {
  IMaintenanceTask,
  MaintenanceContext,
  MaintenanceTaskResult,
} from '../imaintenance-task.interface.js';
import type { StewardshipStage } from '../stewardship.types.js';

/**
 * Wraps Phase 8.6 {@link ILearningOrchestrator} at the `ranking-refresh` stage —
 * same behavior as `npm run learning:run`.
 */
export class RankingRefreshTask implements IMaintenanceTask {
  readonly id = 'ranking-refresh';
  readonly stage: StewardshipStage = 'ranking-refresh';

  constructor(
    private readonly learningOrchestrator: ILearningOrchestrator,
    private readonly enabled: boolean,
  ) {}

  async run(ctx: MaintenanceContext): Promise<MaintenanceTaskResult> {
    if (!this.enabled) {
      return {
        taskId: this.id,
        stage: this.stage,
        status: 'skipped',
        scanned: 0,
        changed: 0,
        findings: [
          'LEARNING_ENGINE_ENABLED=false or LEARNING_STORE_PROVIDER!=sql — run learning:run manually',
        ],
      };
    }

    const report = await this.learningOrchestrator.run(ctx.scope, {
      dryRun: ctx.dryRun,
      projectId: ctx.projectId,
    });

    const changed = ctx.dryRun ? 0 : report.rankingSnapshot ? 1 : 0;

    return {
      taskId: this.id,
      stage: this.stage,
      status: 'ok',
      scanned: report.eventsProcessed,
      changed,
      findings: [
        `events processed: ${report.eventsProcessed}`,
        `ranking snapshot: ${report.rankingSnapshot?.snapshotId ?? 'none'}`,
        `recommendations: ${report.recommendationsGenerated}`,
      ],
    };
  }
}
