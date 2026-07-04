import type { MemoryScope } from '../../types/memory-scope.js';
import type { IMaintenanceTask, MaintenanceTaskResult } from './imaintenance-task.interface.js';
import type {
  IMemoryStewardshipOrchestrator,
  StewardshipRunOptions,
  StewardshipRunReport,
} from './imemory-stewardship-orchestrator.interface.js';
import type { IStewardshipRunStore } from './istewardship-run-store.interface.js';
import { STAGE_INDEX } from './stewardship.types.js';

export interface StewardshipOrchestratorDeps {
  runStore?: IStewardshipRunStore;
  /** Clock injection for deterministic tests. */
  now?: () => Date;
}

/**
 * Default stewardship orchestrator (Phase 04.7 · ADR-045).
 * Runs tasks in the fixed stage order; a failing task is isolated so the
 * remaining pipeline still completes. Dry-run is the default.
 */
export class MemoryStewardshipOrchestrator implements IMemoryStewardshipOrchestrator {
  private readonly tasks: IMaintenanceTask[];
  private readonly runStore?: IStewardshipRunStore;
  private readonly now: () => Date;

  constructor(tasks: IMaintenanceTask[], deps: StewardshipOrchestratorDeps = {}) {
    this.tasks = [...tasks].sort((a, b) => STAGE_INDEX[a.stage] - STAGE_INDEX[b.stage]);
    this.runStore = deps.runStore;
    this.now = deps.now ?? (() => new Date());
  }

  async run(
    scope: MemoryScope,
    options: StewardshipRunOptions = {},
  ): Promise<StewardshipRunReport> {
    const dryRun = options.dryRun ?? true;
    const started = this.now();
    const ctx = { scope, dryRun, projectId: options.projectId, now: started };

    const results: MaintenanceTaskResult[] = [];
    for (const task of this.tasks) {
      try {
        results.push(await task.run(ctx));
      } catch (error) {
        results.push({
          taskId: task.id,
          stage: task.stage,
          status: 'error',
          scanned: 0,
          changed: 0,
          findings: [],
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const finished = this.now();
    const report: StewardshipRunReport = {
      runId: crypto.randomUUID(),
      ownerId: scope.ownerId,
      projectId: options.projectId,
      dryRun,
      startedAt: started.toISOString(),
      finishedAt: finished.toISOString(),
      durationMs: finished.getTime() - started.getTime(),
      tasks: results,
      totalScanned: results.reduce((sum, r) => sum + r.scanned, 0),
      totalChanged: results.reduce((sum, r) => sum + r.changed, 0),
      hadErrors: results.some((r) => r.status === 'error'),
    };

    if (this.runStore) {
      await this.runStore.save(report);
    }
    return report;
  }
}
