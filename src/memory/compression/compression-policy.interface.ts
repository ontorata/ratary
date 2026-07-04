import type { MemoryLevel } from '../../types/memory-level.js';
import type { CompressionCandidate, CompressionContext } from './compression.types.js';

/** Pure policy — no I/O */
export interface ICompressionPolicy {
  shouldCompress(input: CompressionCandidate, ctx: CompressionContext): boolean;
  targetLevel(input: CompressionCandidate): MemoryLevel;
  algorithmId(): string;
  policyVersion(): number;
}
