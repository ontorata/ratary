import type { MemoryScope } from '../types/memory-scope.js';
import type { IMemoryStewardshipOrchestrator } from '../memory/stewardship/imemory-stewardship-orchestrator.interface.js';
import type { StewardshipRunOptions } from '../memory/stewardship/imemory-stewardship-orchestrator.interface.js';
import type { IStewardshipScheduler } from '../ports/stewardship/istewardship-scheduler.port.js';

/** In-process stewardship scheduler — runs orchestrator immediately on enqueue. */
export class LocalStewardshipScheduler implements IStewardshipScheduler {
  constructor(private readonly orchestrator: IMemoryStewardshipOrchestrator) {}

  async enqueue(scope: MemoryScope, options?: StewardshipRunOptions): Promise<string> {
    const report = await this.orchestrator.run(scope, options);
    return report.runId;
  }
}
