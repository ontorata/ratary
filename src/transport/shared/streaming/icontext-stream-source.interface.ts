import type { BuildContextRequest } from '../../../memory/context.service.js';
import type { MemoryScope } from '../../../types/memory-scope.js';
import type { ContextChunk } from './context-chunk.types.js';

/** Application-side port — yields ranked context slices after a single build. */
export interface IContextStreamSource {
  stream(input: BuildContextRequest, scope: MemoryScope): AsyncIterable<ContextChunk>;
}
