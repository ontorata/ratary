import type { IMemoryReader } from '../../../repositories/memory.repository.interface.js';
import type { MemoryLevel } from '../../../types/memory-level.js';
import type {
  IMaintenanceTask,
  MaintenanceContext,
  MaintenanceTaskResult,
} from '../imaintenance-task.interface.js';
import type { StewardshipStage } from '../stewardship.types.js';

/**
 * Read-only retrieval health summary: level distribution and active/archived
 * split, tagged with the active ranking policy version. Surfaces whether the
 * corpus is well-shaped for retrieval without changing ranking config.
 */
export class RetrievalOptimizationTask implements IMaintenanceTask {
  readonly id = 'retrieval-optimization';
  readonly stage: StewardshipStage = 'retrieval-optimization';

  constructor(
    private readonly reader: IMemoryReader,
    private readonly retrievalPolicyVersion: string,
  ) {}

  async run(ctx: MaintenanceContext): Promise<MaintenanceTaskResult> {
    const memories = await this.reader.findAllByOwner(ctx.scope.ownerId);
    const scoped = ctx.projectId ? memories.filter((m) => m.projectId === ctx.projectId) : memories;

    const active = scoped.filter((m) => !m.archived);
    const byLevel = new Map<MemoryLevel, number>();
    for (const memory of active) {
      byLevel.set(memory.level, (byLevel.get(memory.level) ?? 0) + 1);
    }

    const distribution = [...byLevel.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([level, count]) => `${level}:${count}`)
      .join(' ');

    return {
      taskId: this.id,
      stage: this.stage,
      status: 'ok',
      scanned: scoped.length,
      changed: 0,
      findings: [
        `policy v${this.retrievalPolicyVersion}`,
        `active: ${active.length}, archived: ${scoped.length - active.length}`,
        `levels: ${distribution || 'none'}`,
      ],
    };
  }
}
