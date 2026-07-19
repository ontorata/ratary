import type { IMemoryReader } from '../../../repositories/memory.repository.interface.js';
import type { EntityResolutionPorts } from '../../../composition/create-entity-resolution-ports.js';
import { extractSymbols } from '../../../knowledge/entities/extract-symbols.js';
import type {
  IMaintenanceTask,
  MaintenanceContext,
  MaintenanceTaskResult,
} from '../imaintenance-task.interface.js';
import type { StewardshipStage } from '../stewardship.types.js';

/**
 * Stage #11 — canonical entity resolution (Phase 35 / ADR-068 D4).
 *
 * Off the write hot path: reads memories in scope, extracts structured
 * symbols (codename/tags/keywords — E6), resolves them deterministically,
 * and upserts entity mentions idempotently. Auto-creation follows the E2
 * policy (codename + tag only) and only runs in execute mode — dry-run
 * resolves without mutating anything.
 */
export class EntityResolutionTask implements IMaintenanceTask {
  readonly id = 'entity-resolution';
  readonly stage: StewardshipStage = 'entity-resolution';

  constructor(
    private readonly reader: Pick<IMemoryReader, 'findAllByOwner'>,
    private readonly ports: EntityResolutionPorts,
  ) {}

  async run(ctx: MaintenanceContext): Promise<MaintenanceTaskResult> {
    if (!this.ports.enabled) {
      return {
        taskId: this.id,
        stage: this.stage,
        status: 'skipped',
        scanned: 0,
        changed: 0,
        findings: ['ENTITY_RESOLUTION_ENABLED=false — entity resolution skipped'],
      };
    }

    const { resolver, mentionStore } = this.ports;
    const all = await this.reader.findAllByOwner(ctx.scope.ownerId);
    const scoped = ctx.projectId ? all.filter((m) => m.projectId === ctx.projectId) : all;

    let resolvedCount = 0;
    let unresolvedCount = 0;
    let wouldCreate = 0;
    let mentionsUpserted = 0;

    for (const memory of scoped) {
      const symbols = extractSymbols(memory);
      if (symbols.length === 0) {
        continue;
      }

      const resolutions = ctx.dryRun
        ? await resolver.resolve(ctx.scope.ownerId, symbols)
        : await resolver.resolveWithAutoCreate(ctx.scope.ownerId, symbols);

      for (const resolution of resolutions) {
        if (!resolution.resolved) {
          unresolvedCount += 1;
          if (ctx.dryRun && (resolution.field === 'codename' || resolution.field === 'tag')) {
            wouldCreate += 1;
          }
          continue;
        }

        resolvedCount += 1;
        if (!ctx.dryRun) {
          const inserted = await mentionStore.upsert({
            ownerId: ctx.scope.ownerId,
            memoryId: memory.id,
            entityId: resolution.entity.id,
            field: resolution.field,
            confidence: resolution.confidence,
            evidence: resolution.evidence,
            sourceType: 'inferred',
          });
          if (inserted) {
            mentionsUpserted += 1;
          }
        }
      }
    }

    return {
      taskId: this.id,
      stage: this.stage,
      status: 'ok',
      scanned: scoped.length,
      changed: ctx.dryRun ? 0 : mentionsUpserted,
      findings: [
        `symbols resolved: ${resolvedCount}, unresolved: ${unresolvedCount}`,
        ctx.dryRun
          ? `dry-run — would auto-create (codename/tag): ${wouldCreate}`
          : `mentions upserted: ${mentionsUpserted}`,
      ],
    };
  }
}
