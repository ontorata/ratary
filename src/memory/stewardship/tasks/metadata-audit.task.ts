import type { IMemoryReader } from '../../../repositories/memory.repository.interface.js';
import type {
  IMaintenanceTask,
  MaintenanceContext,
  MaintenanceTaskResult,
} from '../imaintenance-task.interface.js';
import type { StewardshipStage } from '../stewardship.types.js';

/**
 * Read-only detection of memories with missing derived metadata
 * (codename, slug, semantic hash). Repair itself is delegated to the
 * existing knowledge/intelligence backfill scripts.
 */
export class MetadataAuditTask implements IMaintenanceTask {
  readonly id = 'metadata-audit';
  readonly stage: StewardshipStage = 'metadata-repair';

  constructor(private readonly reader: IMemoryReader) {}

  async run(ctx: MaintenanceContext): Promise<MaintenanceTaskResult> {
    const memories = await this.reader.findAllByOwner(ctx.scope.ownerId);
    const scoped = ctx.projectId ? memories.filter((m) => m.projectId === ctx.projectId) : memories;

    const missingCodename = scoped.filter((m) => !m.codename).length;
    const missingSlug = scoped.filter((m) => !m.slug).length;
    const missingHash = scoped.filter((m) => !m.semanticHash).length;

    const findings: string[] = [];
    if (missingCodename > 0) findings.push(`${missingCodename} missing codename`);
    if (missingSlug > 0) findings.push(`${missingSlug} missing slug`);
    if (missingHash > 0) findings.push(`${missingHash} missing semantic hash`);
    if (findings.length === 0) findings.push('all metadata present');

    return {
      taskId: this.id,
      stage: this.stage,
      status: 'ok',
      scanned: scoped.length,
      changed: 0,
      findings,
    };
  }
}
