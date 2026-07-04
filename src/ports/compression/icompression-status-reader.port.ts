import type {
  CompressionOwnerStatus,
  CompressionStatusQuery,
} from '../../memory/compression/compression.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';

export interface ICompressionStatusReader {
  getStatus(scope: MemoryScope, query?: CompressionStatusQuery): Promise<CompressionOwnerStatus>;
}
