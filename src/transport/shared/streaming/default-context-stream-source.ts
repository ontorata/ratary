import type { ContextService } from '../../../memory/context.service.js';
import type { BuildContextRequest } from '../../../memory/context.service.js';
import type { MemoryScope } from '../../../types/memory-scope.js';
import type { ContextChunk } from './context-chunk.types.js';
import type { IContextStreamSource } from './icontext-stream-source.interface.js';

/** Builds context once, then yields ranked slices — no duplicated ranking logic. */
export class DefaultContextStreamSource implements IContextStreamSource {
  constructor(private readonly contextService: ContextService) {}

  async *stream(input: BuildContextRequest, scope: MemoryScope): AsyncIterable<ContextChunk> {
    const result = await this.contextService.buildContext(scope, input);
    let sequence = 0;

    yield {
      sequence: sequence++,
      type: 'metadata',
      payload: { totalCandidates: result.totalCandidates, retrievalPlan: result.retrievalPlan },
    };

    for (const memory of result.memories) {
      yield {
        sequence: sequence++,
        type: 'memory',
        payload: memory,
      };
    }

    yield {
      sequence: sequence++,
      type: 'done',
      payload: { context: result.context },
    };
  }
}
