import type { MemoryScope } from '../../types/memory-scope.js';
import type { StewardshipRunOptions } from '../../memory/stewardship/imemory-stewardship-orchestrator.interface.js';

export interface IStewardshipScheduler {
  enqueue(scope: MemoryScope, options?: StewardshipRunOptions): Promise<string>;
}
