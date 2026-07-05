import type { Memory } from '../../types/memory.js';

export interface MultiQueryFusionOptions {
  k?: number;
}

export interface IMultiQueryFusion {
  fuse(
    perQueryRanked: Map<string, Array<Memory & { relevanceScore?: number }>>,
    options?: MultiQueryFusionOptions,
  ): Array<Memory & { relevanceScore: number }>;
}

export class MultiQueryRrfFusion implements IMultiQueryFusion {
  fuse(
    perQueryRanked: Map<string, Array<Memory & { relevanceScore?: number }>>,
    options: MultiQueryFusionOptions = {},
  ): Array<Memory & { relevanceScore: number }> {
    const k = options.k ?? 60;
    const scores = new Map<string, { memory: Memory; score: number }>();

    for (const ranked of perQueryRanked.values()) {
      ranked.forEach((memory, index) => {
        const rank = index + 1;
        const contribution = 1 / (k + rank);
        const existing = scores.get(memory.id);
        if (existing) {
          existing.score += contribution;
        } else {
          scores.set(memory.id, { memory, score: contribution });
        }
      });
    }

    return [...scores.values()]
      .sort((a, b) => b.score - a.score)
      .map(({ memory, score }) => ({
        ...memory,
        relevanceScore: Math.round(score * 1000),
      }));
  }
}
