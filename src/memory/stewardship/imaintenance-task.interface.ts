import type { MemoryScope } from '../../types/memory-scope.js';
import type { MaintenanceTaskStatus, StewardshipStage } from './stewardship.types.js';

/** Execution context shared by every maintenance task in a stewardship run. */
export interface MaintenanceContext {
  readonly scope: MemoryScope;
  /** When true (default), tasks report intended actions without mutating state. */
  readonly dryRun: boolean;
  readonly projectId?: string;
  readonly now: Date;
}

/** Deterministic outcome of a single maintenance task. */
export interface MaintenanceTaskResult {
  readonly taskId: string;
  readonly stage: StewardshipStage;
  readonly status: MaintenanceTaskStatus;
  /** Records examined by the task. */
  readonly scanned: number;
  /** Records mutated (always 0 in dry-run). */
  readonly changed: number;
  /** Human-readable, deterministic summary lines. */
  readonly findings: string[];
  readonly error?: string;
}

/**
 * A single deterministic maintenance step. Implementations MUST be idempotent
 * and MUST NOT mutate state when `ctx.dryRun` is true.
 */
export interface IMaintenanceTask {
  readonly id: string;
  readonly stage: StewardshipStage;
  run(ctx: MaintenanceContext): Promise<MaintenanceTaskResult>;
}
