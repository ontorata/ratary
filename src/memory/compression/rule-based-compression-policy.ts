import type { MemoryLevel } from '../../types/memory-level.js';
import type { ICompressionPolicy } from './compression-policy.interface.js';
import type { CompressionCandidate, CompressionContext } from './compression.types.js';

const POLICY_VERSION = 1;
const LARGE_CONTENT_CHARS = 8_000;

export class RuleBasedCompressionPolicy implements ICompressionPolicy {
  shouldCompress(input: CompressionCandidate, _ctx: CompressionContext): boolean {
    if ((input.duplicateClusterSize ?? 0) >= 2) {
      return true;
    }
    if ((input.totalChars ?? input.memory.content.length) > LARGE_CONTENT_CHARS) {
      return false;
    }
    return false;
  }

  targetLevel(input: CompressionCandidate): MemoryLevel {
    if ((input.duplicateClusterSize ?? 0) >= 3) {
      return 'canonical';
    }
    return 'summary';
  }

  algorithmId(): string {
    return 'rule_v1';
  }

  policyVersion(): number {
    return POLICY_VERSION;
  }
}
