import type { IMemoryMergePolicy } from './imemory-merge-policy.interface.js';
import type { MemorySnapshot } from './memory-evolution.types.js';

/** Field-level merge: incoming wins on textual fields; union tags/keywords. */
export class DefaultMemoryMergePolicy implements IMemoryMergePolicy {
  merge(base: MemorySnapshot, incoming: MemorySnapshot): MemorySnapshot {
    return {
      ...base,
      title: incoming.title || base.title,
      content: incoming.content || base.content,
      summary: incoming.summary || base.summary,
      tags: [...new Set([...base.tags, ...incoming.tags])],
      keywords: [...new Set([...base.keywords, ...incoming.keywords])],
      importance: Math.max(base.importance, incoming.importance),
      notes: incoming.notes || base.notes,
    };
  }
}
