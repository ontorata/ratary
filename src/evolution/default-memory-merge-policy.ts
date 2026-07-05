import type { IMemoryMergePolicy } from './imemory-merge-policy.interface.js';
import type { MemorySnapshot } from './memory-evolution.types.js';

/** Keep base value when incoming text is empty or whitespace-only (prevents silent wipe on partial sync). */
function preferNonEmpty(incoming: string, base: string): string {
  return incoming.trim().length > 0 ? incoming : base;
}

/** Field-level merge for sync `field_merge` and future branch merge — incoming wins on non-empty text; union tags/keywords. */
export class DefaultMemoryMergePolicy implements IMemoryMergePolicy {
  merge(base: MemorySnapshot, incoming: MemorySnapshot): MemorySnapshot {
    return {
      ...base,
      title: preferNonEmpty(incoming.title, base.title),
      content: preferNonEmpty(incoming.content, base.content),
      summary: preferNonEmpty(incoming.summary, base.summary),
      notes: preferNonEmpty(incoming.notes, base.notes),
      tags: [...new Set([...base.tags, ...incoming.tags])],
      keywords: [...new Set([...base.keywords, ...incoming.keywords])],
      importance: Math.max(base.importance, incoming.importance),
    };
  }
}
