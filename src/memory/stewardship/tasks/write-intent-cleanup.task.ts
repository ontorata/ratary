import type { IMemoryReader } from '../../../repositories/memory.repository.interface.js';
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
 *
 * CLAIMED intents are never bulk-deleted (owner review requirement). Each
 * expired claimed intent is resolved individually:
 * - canonical memory EXISTS ⇒ the create finished but the status flip was
 *   lost (markCompleted is best-effort) ⇒ resolved, safe to delete;
 * - canonical memory MISSING ⇒ true orphan (claim without result) ⇒ KEPT and
 *   reported in findings for operator analysis.
 */
export class WriteIntentCleanupTask implements IMaintenanceTask {
  readonly id = 'write-intent-cleanup';
  readonly stage: StewardshipStage = 'metadata-repair';

  constructor(
    private readonly intents: Pick<
      IWriteIntentStore,
      | 'deleteExpiredCompleted'
      | 'countExpiredCompleted'
      | 'listExpiredClaimed'
      | 'deleteByRequestId'
    >,
    private readonly memoryReader: Pick<IMemoryReader, 'findById'>,
    private readonly ttlDays: number,
  ) {}

  async run(ctx: MaintenanceContext): Promise<MaintenanceTaskResult> {
    const cutoff = new Date(ctx.now.getTime() - this.ttlDays * DAY_MS).toISOString();
    const ownerId = ctx.scope.ownerId;

    const expiredCompleted = await this.intents.countExpiredCompleted(ownerId, cutoff);
    const expiredClaimed = await this.intents.listExpiredClaimed(ownerId, cutoff);

    let removed = 0;
    let resolvedClaims = 0;
    let orphanClaims = 0;

    for (const intent of expiredClaimed) {
      const memory = await this.memoryReader.findById(intent.resourceId, ownerId);
      if (!memory) {
        orphanClaims += 1;
        continue;
      }
      resolvedClaims += 1;
      if (!ctx.dryRun) {
        await this.intents.deleteByRequestId(ownerId, intent.requestId);
        removed += 1;
      }
    }

    if (!ctx.dryRun && expiredCompleted > 0) {
      removed += await this.intents.deleteExpiredCompleted(ownerId, cutoff);
    }

    const findings = [
      `expired completed intents (> ${this.ttlDays}d): ${expiredCompleted}`,
      `expired claimed intents: ${expiredClaimed.length} (resolvable: ${resolvedClaims}, orphaned — kept: ${orphanClaims})`,
      ctx.dryRun ? 'dry-run — nothing deleted' : `removed ${removed}`,
    ];

    return {
      taskId: this.id,
      stage: this.stage,
      status: 'ok',
      scanned: expiredCompleted + expiredClaimed.length,
      changed: removed,
      findings,
    };
  }
}
