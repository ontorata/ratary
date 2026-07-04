import type { IMemoryReader } from '../../../repositories/memory.repository.interface.js';
import type {
  IMaintenanceTask,
  MaintenanceContext,
  MaintenanceTaskResult,
} from '../imaintenance-task.interface.js';
import type { StewardshipStage } from '../stewardship.types.js';

/**
 * Read-only detection of active memories missing an embedding id.
 * Actual (re)embedding is performed asynchronously by the embedding backfill
 * runner — this task only surfaces the backlog deterministically.
 */
export class EmbeddingAuditTask implements IMaintenanceTask {
  readonly id = 'embedding-audit';
  readonly stage: StewardshipStage = 'embedding-repair';

  constructor(private readonly reader: IMemoryReader) {}

  async run(ctx: MaintenanceContext): Promise<MaintenanceTaskResult> {
    const memories = await this.reader.findAllByOwner(ctx.scope.ownerId);
    const scoped = memories.filter(
      (m) => !m.archived && (!ctx.projectId || m.projectId === ctx.projectId),
    );
    const missing = scoped.filter((m) => !m.embeddingId).length;

    return {
      taskId: this.id,
      stage: this.stage,
      status: 'ok',
      scanned: scoped.length,
      changed: 0,
      findings:
        missing > 0
          ? [`${missing} active memories without embedding (run db:backfill-embeddings)`]
          : ['all active memories embedded'],
    };
  }
}
