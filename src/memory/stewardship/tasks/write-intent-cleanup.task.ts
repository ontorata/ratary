import type { IWriteIntentStore } from '../../../ports/write-intents/iwrite-intent-store.port.js';
import type {
  IMaintenanceTask,
  MaintenanceContext,
  MaintenanceTaskResult,
} from '../imaintenance-task.interface.js';
import type { StewardshipStage } from '../stewardship.types.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * PI-C (ADR-067) — TTL cleanup for memory_write_intents.
 *
 * Runs at the existing `metadata-repair` stage (bookkeeping hygiene, no new
 * stage). TTL is a CLEANUP policy, not part of the idempotency guarantee:
 * idempotency is guaranteed while the intent record exists (owner decision C5).
 */
export class WriteIntentCleanupTask implements IMaintenanceTask {
  readonly id = 'write-intent-cleanup';
  readonly stage: StewardshipStage = 'metadata-repair';

  constructor(
    private readonly intents: Pick<IWriteIntentStore, 'deleteExpired' | 'countExpired'>,
    private readonly ttlDays: number,
  ) {}

  async run(ctx: MaintenanceContext): Promise<MaintenanceTaskResult> {
    const cutoff = new Date(ctx.now.getTime() - this.ttlDays * DAY_MS).toISOString();
    const ownerId = ctx.scope.ownerId;
    const expired = await this.intents.countExpired(ownerId, cutoff);
    const removed =
      ctx.dryRun || expired === 0 ? 0 : await this.intents.deleteExpired(ownerId, cutoff);

    return {
      taskId: this.id,
      stage: this.stage,
      status: 'ok',
      scanned: expired,
      changed: removed,
      findings: [
        `write intents older than ${this.ttlDays}d: ${expired}${ctx.dryRun ? ' (dry-run, kept)' : ` (removed ${removed})`}`,
      ],
    };
  }
}
