import type { StewardshipRunReport } from './imemory-stewardship-orchestrator.interface.js';

/** Persistence port for stewardship run history (audit trail). */
export interface IStewardshipRunStore {
  save(report: StewardshipRunReport): Promise<void>;
  list(ownerId: string, limit?: number): Promise<StewardshipRunReport[]>;
  latest(ownerId: string): Promise<StewardshipRunReport | null>;
}
