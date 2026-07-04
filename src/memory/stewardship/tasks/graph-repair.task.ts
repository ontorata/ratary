import type { IRelationInferenceOrchestrator } from '../../../inference/irelation-inference-orchestrator.interface.js';
import type {
  IMaintenanceTask,
  MaintenanceContext,
  MaintenanceTaskResult,
} from '../imaintenance-task.interface.js';
import type { StewardshipStage } from '../stewardship.types.js';

/**
 * Wraps Phase 8.7 {@link IRelationInferenceOrchestrator} at the `graph-repair`
 * stewardship stage — same behavior as `npm run infer:relations`.
 */
export class GraphRepairTask implements IMaintenanceTask {
  readonly id = 'graph-repair';
  readonly stage: StewardshipStage = 'graph-repair';

  constructor(
    private readonly inferenceOrchestrator: IRelationInferenceOrchestrator,
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
          'RELATION_INFERENCE_ENABLED=false — run infer:relations manually or enable flag',
        ],
      };
    }

    const report = await this.inferenceOrchestrator.run(ctx.scope, {
      dryRun: ctx.dryRun,
      projectId: ctx.projectId,
    });

    const changed = ctx.dryRun ? 0 : report.relationsCreated + report.relationsUpdated;

    return {
      taskId: this.id,
      stage: this.stage,
      status: 'ok',
      scanned: report.candidatesFound,
      changed,
      findings: [
        `candidates: ${report.candidatesFound}`,
        `created: ${report.relationsCreated}, updated: ${report.relationsUpdated}`,
        `skipped (manual): ${report.relationsSkippedManual}`,
        ...(Object.keys(report.bySource).length > 0
          ? [`by source: ${JSON.stringify(report.bySource)}`]
          : []),
      ],
    };
  }
}
