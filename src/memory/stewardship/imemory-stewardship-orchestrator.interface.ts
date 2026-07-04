import type { MemoryScope } from '../../types/memory-scope.js';
import type { MaintenanceTaskResult } from './imaintenance-task.interface.js';

export interface StewardshipRunOptions {
  /** Defaults to true — no mutations unless explicitly disabled. */
  dryRun?: boolean;
  projectId?: string;
}

export interface StewardshipRunReport {
  readonly runId: string;
  readonly ownerId: string;
  readonly projectId?: string;
  readonly dryRun: boolean;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly durationMs: number;
  readonly tasks: MaintenanceTaskResult[];
  readonly totalScanned: number;
  readonly totalChanged: number;
  readonly hadErrors: boolean;
}

/**
 * Runs registered maintenance tasks in the fixed stewardship stage order.
 * Composes existing capabilities (consolidation, audits); introduces no
 * business rules and never changes `MemoryService`.
 */
export interface IMemoryStewardshipOrchestrator {
  run(scope: MemoryScope, options?: StewardshipRunOptions): Promise<StewardshipRunReport>;
}
