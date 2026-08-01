import type { ScoredMemory } from './ranker.js';

export type RetrievalMemoStatus = 'hit' | 'miss' | 'bypass';

type MemoEntry = Readonly<{
  expiresAt: number;
  ranked: readonly ScoredMemory[];
  totalCandidates: number;
}>;

/**
 * ADR-1018 / ADR-1014 — process-local retrieval-stage memo.
 * Caches ranked candidates only; Context Package envelopes are always reminted.
 */
export class RetrievalMemoCache {
  private readonly entries = new Map<string, MemoEntry>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries: number,
    private readonly now: () => number = () => Date.now(),
  ) {}

  get(key: string): MemoEntry | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return null;
    }
    // LRU touch
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry;
  }

  set(key: string, ranked: readonly ScoredMemory[], totalCandidates: number): void {
    if (this.ttlMs <= 0 || this.maxEntries <= 0) return;
    while (this.entries.size >= this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.entries.delete(oldest);
    }
    this.entries.set(key, {
      expiresAt: this.now() + this.ttlMs,
      ranked: Object.freeze([...ranked]),
      totalCandidates,
    });
  }

  clear(): void {
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }
}

export function buildRetrievalMemoKey(parts: {
  ownerId: string;
  workspaceId?: string;
  projectId?: string;
  query?: string;
  tags?: string[];
  levels?: string[];
  limit: number;
  rankingSnapshotVersion?: number | string | null;
}): string {
  return [
    parts.ownerId,
    parts.workspaceId ?? '',
    parts.projectId ?? '',
    parts.query ?? '',
    (parts.tags ?? []).join(','),
    (parts.levels ?? []).join(','),
    String(parts.limit),
    parts.rankingSnapshotVersion == null ? 'none' : String(parts.rankingSnapshotVersion),
  ].join('\u001f');
}
