/**
 * Stage #12 — depends_on → provenance candidates (Phase 36 / ADR-069 D4).
 * v1 = findings only; never writes caused_by (correlation ≠ causation).
 */
import type { ProvenancePorts } from '../../../composition/create-provenance-ports.js';
import type { ISqlDatabase } from '../../../ports/sql/isql-database.port.js';
import { collectDependsOnProvenanceCandidates } from '../../../knowledge/provenance/depends-on-candidates.js';
import type {
  IMaintenanceTask,
  MaintenanceContext,
  MaintenanceTaskResult,
} from '../imaintenance-task.interface.js';
import type { StewardshipStage } from '../stewardship.types.js';

interface DependsOnRow {
  id: string;
  source_memory_id: string;
  target_memory_id: string;
  relation: string;
}

export class ProvenanceCandidatesTask implements IMaintenanceTask {
  readonly id = 'provenance-candidates';
  readonly stage: StewardshipStage = 'provenance-candidates';

  constructor(
    private readonly db: ISqlDatabase,
    private readonly ports: ProvenancePorts,
  ) {}

  async run(ctx: MaintenanceContext): Promise<MaintenanceTaskResult> {
    if (!this.ports.enabled) {
      return {
        taskId: this.id,
        stage: this.stage,
        status: 'skipped',
        scanned: 0,
        changed: 0,
        findings: ['DECISION_PROVENANCE_ENABLED=false — provenance candidates skipped'],
      };
    }

    const rows = await this.db.query<DependsOnRow>(
      `SELECT id, source_memory_id, target_memory_id, relation
       FROM memory_relations
       WHERE owner_id = ? AND relation = 'depends_on'
       ORDER BY id ASC`,
      [ctx.scope.ownerId],
    );

    const candidates = collectDependsOnProvenanceCandidates(
      rows.map((row) => ({
        id: row.id,
        sourceMemoryId: row.source_memory_id,
        targetMemoryId: row.target_memory_id,
        relation: row.relation,
      })),
    );

    // v1: findings only — even execute mode never auto-writes causation.
    return {
      taskId: this.id,
      stage: this.stage,
      status: 'ok',
      scanned: rows.length,
      changed: 0,
      findings: [
        `depends_on scanned: ${rows.length}`,
        `provenance candidates (caused_by suggestions): ${candidates.length}`,
        'v1 findings-only — no caused_by writes (correlation ≠ causation)',
        ...candidates
          .slice(0, 20)
          .map(
            (c) =>
              `candidate ${c.sourceMemoryId} -[caused_by]-> ${c.targetMemoryId} (from ${c.dependsOnRelationId})`,
          ),
      ],
    };
  }
}
