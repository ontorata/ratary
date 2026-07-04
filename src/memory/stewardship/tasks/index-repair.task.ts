import type { SearchGraphOrchestrator } from '../../../search-graph-platform/services/search-graph-orchestrator.js';
import type {
  IMaintenanceTask,
  MaintenanceContext,
  MaintenanceTaskResult,
} from '../imaintenance-task.interface.js';
import type { StewardshipStage } from '../stewardship.types.js';

/**
 * Wraps Phase 21 {@link SearchGraphOrchestrator} at the `index-repair` stage —
 * Meilisearch + Neo4j incremental sync for the scoped owner.
 */
export class IndexRepairTask implements IMaintenanceTask {
  readonly id = 'index-repair';
  readonly stage: StewardshipStage = 'index-repair';

  constructor(
    private readonly searchGraphOrchestrator: SearchGraphOrchestrator,
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
          'SEARCH_GRAPH_PLATFORM_ENABLED=false — run search-graph sync via REST or backfill CLI',
        ],
      };
    }

    const input = {
      mode: 'incremental' as const,
      ownerId: ctx.scope.ownerId,
      dryRun: ctx.dryRun,
    };

    const findings: string[] = [];
    let scanned = 0;
    let changed = 0;
    let hadError = false;

    for (const [label, sync] of [
      ['meilisearch', () => this.searchGraphOrchestrator.syncSearch(input)],
      ['neo4j', () => this.searchGraphOrchestrator.syncGraph(input)],
    ] as const) {
      try {
        const run = await sync();
        scanned += run.stats.scanned;
        if (!ctx.dryRun) {
          changed += run.stats.applied;
        }
        findings.push(`${label}: scanned=${run.stats.scanned} applied=${run.stats.applied}`);
      } catch (error) {
        hadError = true;
        const message = error instanceof Error ? error.message : String(error);
        findings.push(`${label}: error — ${message}`);
      }
    }

    return {
      taskId: this.id,
      stage: this.stage,
      status: hadError ? 'error' : 'ok',
      scanned,
      changed,
      findings,
    };
  }
}
