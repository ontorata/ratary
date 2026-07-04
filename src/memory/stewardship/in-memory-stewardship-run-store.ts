import type { StewardshipRunReport } from './imemory-stewardship-orchestrator.interface.js';
import type { IStewardshipRunStore } from './istewardship-run-store.interface.js';

const DEFAULT_CAP = 50;

/**
 * Default in-memory run store — keeps the most recent runs per owner.
 * A SQL-backed store can replace this behind {@link IStewardshipRunStore}.
 */
export class InMemoryStewardshipRunStore implements IStewardshipRunStore {
  private readonly runs = new Map<string, StewardshipRunReport[]>();

  constructor(private readonly cap: number = DEFAULT_CAP) {}

  async save(report: StewardshipRunReport): Promise<void> {
    const history = this.runs.get(report.ownerId) ?? [];
    history.unshift(report);
    this.runs.set(report.ownerId, history.slice(0, this.cap));
  }

  async list(ownerId: string, limit = this.cap): Promise<StewardshipRunReport[]> {
    return (this.runs.get(ownerId) ?? []).slice(0, limit);
  }

  async latest(ownerId: string): Promise<StewardshipRunReport | null> {
    return this.runs.get(ownerId)?.[0] ?? null;
  }
}
