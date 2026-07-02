import type { Memory } from '../types/memory.js';
import type { MemoryLevel } from '../types/memory-level.js';
import { rankMemories, type SearchQueryContext } from '../search/ranking.engine.js';
import {
  RETRIEVAL_DEFAULT_LIMIT,
  RETRIEVAL_MAX_RANKED,
  RETRIEVAL_WEIGHTS,
} from '../search/ranking.config.js';

export interface ScoredMemory extends Memory {
  relevanceScore: number;
}

const LEVEL_BOOST: Record<MemoryLevel, number> = {
  canonical: RETRIEVAL_WEIGHTS.levelCanonical,
  summary: RETRIEVAL_WEIGHTS.levelSummary,
  note: RETRIEVAL_WEIGHTS.levelNote,
  raw: RETRIEVAL_WEIGHTS.levelRaw,
};

function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

function recencyBoost(updatedAt: string): number {
  const days = daysSince(updatedAt);
  if (days <= 7) return RETRIEVAL_WEIGHTS.recencyDays7;
  if (days <= 30) return RETRIEVAL_WEIGHTS.recencyDays30;
  return 0;
}

function accessBoost(accessCount: number): number {
  if (accessCount <= 0) return 0;
  return Math.round(RETRIEVAL_WEIGHTS.accessCountLog * Math.log1p(accessCount));
}

export function applyRetrievalBoosts(memory: ScoredMemory): ScoredMemory {
  const levelBoost = LEVEL_BOOST[memory.level] ?? 0;
  const boosted =
    memory.relevanceScore +
    levelBoost +
    recencyBoost(memory.updatedAt) +
    accessBoost(memory.accessCount);

  return { ...memory, relevanceScore: boosted };
}

export class Ranker {
  rank(
    memories: Memory[],
    query: SearchQueryContext,
    limit = RETRIEVAL_DEFAULT_LIMIT,
  ): ScoredMemory[] {
    const cappedLimit = Math.min(Math.max(limit, 1), RETRIEVAL_MAX_RANKED);
    return rankMemories(memories, query)
      .map(applyRetrievalBoosts)
      .sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return b.updatedAt.localeCompare(a.updatedAt);
      })
      .slice(0, cappedLimit);
  }
}
