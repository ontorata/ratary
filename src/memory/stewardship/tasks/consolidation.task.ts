import type { MemoryConsolidator } from '../../consolidator.js';
import type {
  IMaintenanceTask,
  MaintenanceContext,
  MaintenanceTaskResult,
} from '../imaintenance-task.interface.js';
import type { StewardshipStage } from '../stewardship.types.js';

/**
 * Wraps the existing {@link MemoryConsolidator}: duplicate detection, merge,
 * compress/summarize, archive, and stale-importance promotion — all deterministic
 * and honoring dry-run. No new business logic is introduced here.
 */
export class ConsolidationTask implements IMaintenanceTask {
  readonly id = 'consolidation';
  readonly stage: StewardshipStage = 'merge-compress';

  constructor(private readonly consolidator: MemoryConsolidator) {}

  async run(ctx: MaintenanceContext): Promise<MaintenanceTaskResult> {
    const report = await this.consolidator.run(ctx.scope, {
      dryRun: ctx.dryRun,
      projectId: ctx.projectId,
      generateSummary: !ctx.dryRun,
    });

    const changed = ctx.dryRun
      ? 0
      : report.duplicatesArchived +
        report.summariesCreated +
        report.stalePromoted +
        report.relationsCreated;

    return {
      taskId: this.id,
      stage: this.stage,
      status: 'ok',
      scanned: report.duplicatesFound,
      changed,
      findings: [
        `duplicates found: ${report.duplicatesFound}`,
        `duplicates archived: ${report.duplicatesArchived}`,
        `summaries created: ${report.summariesCreated}`,
        `stale promoted: ${report.stalePromoted}`,
        `relations created: ${report.relationsCreated}`,
      ],
    };
  }
}
