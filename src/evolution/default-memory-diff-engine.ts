import type { IMemoryDiffEngine } from './imemory-diff-engine.interface.js';
import type { MemorySnapshot, MemoryVersionDiff } from './memory-evolution.types.js';

const DIFF_FIELDS: (keyof MemorySnapshot)[] = [
  'title',
  'content',
  'summary',
  'tags',
  'keywords',
  'importance',
  'category',
  'memoryType',
  'favorite',
  'archived',
  'level',
];

export class DefaultMemoryDiffEngine implements IMemoryDiffEngine {
  diff(
    memoryId: string,
    fromVersion: number | 'current',
    toVersion: number | 'current',
    before: MemorySnapshot,
    after: MemorySnapshot,
  ): MemoryVersionDiff {
    const changes = DIFF_FIELDS.flatMap((field) => {
      const left = before[field];
      const right = after[field];
      if (JSON.stringify(left) === JSON.stringify(right)) {
        return [];
      }
      return [{ field, before: left, after: right }];
    });

    return {
      memoryId,
      fromVersion,
      toVersion,
      changes,
      confidence: 0,
    };
  }
}
