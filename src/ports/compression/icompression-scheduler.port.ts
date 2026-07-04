import type { MemoryScope } from '../../types/memory-scope.js';
import type {
  CompressionJobOptions,
  CompressionJobReport,
} from '../../memory/compression/compression.types.js';

export interface ICompressionScheduler {
  enqueue(scope: MemoryScope, options?: CompressionJobOptions): Promise<string>;
  runPending(limit: number): Promise<CompressionJobReport>;
}
