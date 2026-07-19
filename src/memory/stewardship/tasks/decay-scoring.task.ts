import type {
  IMemoryReader,
  IMemoryWriter,
} from '../../../repositories/memory.repository.interface.js';
import type { IMemoryRelationRepository } from '../../../repositories/memory-relation.repository.interface.js';
import {
  combineSignals,
  computeDecaySignals,
  isProtectedMemory,
  nextLifecycleState,
  type DecayWeights,
} from '../../decay/index.js';
import type {
  IMaintenanceTask,
  MaintenanceContext,
  MaintenanceTaskResult,
} from '../imaintenance-task.interface.js';
import type { StewardshipStage } from '../stewardship.types.js';

export interface DecayScoringTaskConfig {
  readonly enabled: boolean;
  readonly halfLifeDays: number;
  readonly archiveFloor: number;
  readonly retentionDays: number;
  readonly weights: DecayWeights;
}

/**
 * Stage #10 — memory decay & lifecycle scoring (PI-A / P2-A).
 *
 * Batch recomputation of decay signals, weighted score, and lifecycle state
 * for every non-archived memory in scope. Skipped entirely while
 * `DECAY_SCORING_ENABLED=false` (freeze-safe default during the P1-E
 * operational window). Dry-run reports intended transitions without mutating.
 */
export class DecayScoringTask implements IMaintenanceTask {
  readonly id = 'decay-scoring';
  readonly stage: StewardshipStage = 'decay-scoring';

  constructor(
    private readonly reader: IMemoryReader,
    private readonly writer: Pick<IMemoryWriter, 'applyDecayResult'>,
    private readonly relations: Pick<IMemoryRelationRepository, 'countDegreeByOwner'>,
    private readonly config: DecayScoringTaskConfig,
  ) {}

  async run(ctx: MaintenanceContext): Promise<MaintenanceTaskResult> {
    if (!this.config.enabled) {
      return {
        taskId: this.id,
        stage: this.stage,
        status: 'skipped',
        scanned: 0,
        changed: 0,
        findings: ['DECAY_SCORING_ENABLED=false — decay scoring skipped'],
      };
    }

    const all = await this.reader.findAllByOwner(ctx.scope.ownerId);
    const scoped = ctx.projectId ? all.filter((m) => m.projectId === ctx.projectId) : all;
    const candidates = scoped.filter((m) => !m.archived);
    const degrees = await this.relations.countDegreeByOwner(ctx.scope.ownerId);

    const transitions = new Map<string, number>();
    let protectedCount = 0;
    let changed = 0;

    for (const memory of candidates) {
      const relationDegree = degrees.get(memory.id) ?? 0;
      const isProtected = isProtectedMemory({
        favorite: memory.favorite,
        importance: memory.importance,
        tags: memory.tags,
      });
      if (isProtected) protectedCount += 1;

      const signals = computeDecaySignals(
        {
          updatedAt: memory.updatedAt,
          lastAccessed: memory.lastAccessed,
          accessCount: memory.accessCount,
          relationDegree,
          importance: memory.importance,
          favorite: memory.favorite,
          tags: memory.tags,
        },
        { halfLifeDays: this.config.halfLifeDays },
        ctx.now,
        isProtected,
      );
      const score = combineSignals(signals, this.config.weights);
      const nextState = nextLifecycleState(
        score,
        {
          archiveFloor: this.config.archiveFloor,
          retentionDays: this.config.retentionDays,
        },
        {
          isProtected,
          relationDegree,
          createdAt: memory.createdAt,
          lastAccessed: memory.lastAccessed,
          now: ctx.now,
        },
      );

      const currentState = memory.lifecycleState ?? 'active';
      const transitionKey = `${currentState}->${nextState}`;
      if (currentState !== nextState) {
        transitions.set(transitionKey, (transitions.get(transitionKey) ?? 0) + 1);
      }

      if (!ctx.dryRun) {
        await this.writer.applyDecayResult(memory.id, ctx.scope.ownerId, {
          score,
          signalsJson: JSON.stringify(signals),
          computedAt: ctx.now.toISOString(),
          lifecycleState: nextState,
        });
        changed += 1;
      }
    }

    const transitionSummary =
      [...transitions.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, count]) => `${key}:${count}`)
        .join(' ') || 'none';

    return {
      taskId: this.id,
      stage: this.stage,
      status: 'ok',
      scanned: candidates.length,
      changed,
      findings: [
        `protected: ${protectedCount}/${candidates.length}`,
        `transitions${ctx.dryRun ? ' (intended)' : ''}: ${transitionSummary}`,
        `half-life ${this.config.halfLifeDays}d, floor ${this.config.archiveFloor}, retention ${this.config.retentionDays}d`,
      ],
    };
  }
}
