import type { Memory } from '../types/memory.js';
import { RANKING_WEIGHTS } from './ranking.config.js';

export interface SearchQueryContext {
  q?: string;
  tag?: string;
}

function contains(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function exact(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function scoreMemory(memory: Memory, query: SearchQueryContext): number {
  const q = query.q?.trim();
  let score = 0;

  if (q) {
    if (memory.codename) {
      if (exact(memory.codename, q)) score += RANKING_WEIGHTS.codenameExact;
      else if (contains(memory.codename, q)) score += RANKING_WEIGHTS.codenameContains;
    }

    if (exact(memory.title, q)) score += RANKING_WEIGHTS.titleExact;
    else if (contains(memory.title, q)) score += RANKING_WEIGHTS.titleContains;

    if (memory.summary && contains(memory.summary, q)) {
      score += RANKING_WEIGHTS.summaryContains;
    }

    for (const keyword of memory.keywords) {
      if (contains(keyword, q) || contains(q, keyword)) {
        score += RANKING_WEIGHTS.keywordMatch;
        break;
      }
    }

    for (const tag of memory.tags) {
      if (contains(tag, q) || contains(q, tag)) {
        score += RANKING_WEIGHTS.tagMatch;
        break;
      }
    }

    if (memory.project) {
      if (exact(memory.project, q)) score += RANKING_WEIGHTS.projectExact;
      else if (contains(memory.project, q)) score += RANKING_WEIGHTS.projectContains;
    }

    if (contains(memory.content, q)) score += RANKING_WEIGHTS.contentContains;
  }

  if (query.tag) {
    const tagLower = query.tag.toLowerCase();
    if (memory.tags.some((t) => t.toLowerCase() === tagLower)) {
      score += RANKING_WEIGHTS.tagMatch;
    }
    if (memory.keywords.some((k) => k === tagLower)) {
      score += RANKING_WEIGHTS.keywordMatch;
    }
  }

  if (memory.favorite) {
    score += RANKING_WEIGHTS.favoriteBonus;
  }

  const importanceMultiplier = 0.5 + memory.importance / 100;
  return Math.round(score * importanceMultiplier);
}

export function rankMemories(
  memories: Memory[],
  query: SearchQueryContext,
): Array<Memory & { relevanceScore: number }> {
  return memories
    .map((memory) => ({
      ...memory,
      relevanceScore: scoreMemory(memory, query),
    }))
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}
