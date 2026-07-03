import type { Memory } from '../types/memory.js';
import type { RetrievalFilters } from '../repositories/memory.repository.interface.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import type { RegisteredRetrievalSource, RetrievalSourceRole } from './retrieval-source.types.js';
import {
  RRF_CONFIG,
  RETRIEVAL_CANDIDATE_CAP,
  getRrfSourceCap,
  getRrfSourceWeight,
} from '../search/ranking.config.js';

/**
 * Composite retrieval candidate source that merges candidates from multiple
 * IRetrievalCandidateSource implementations using Reciprocal Rank Fusion (RRF).
 *
 * @see ADR-001 Multi-Source Retrieval
 * @see ADR-006 Appendix B — role-based caps (not array index)
 */
export class CompositeRetrievalCandidateSource implements IRetrievalCandidateSource {
  private readonly activeRoles: RetrievalSourceRole[];

  constructor(private readonly sources: RegisteredRetrievalSource[]) {
    this.activeRoles = sources.map(({ role }) => role);
  }

  /**
   * Find candidates by merging ranked results from all sources using RRF.
   *
   * Algorithm:
   * 1. Fetch up to role-based SOURCE_CAPS per source
   * 2. For each unique memory, compute RRF score: Σᵢ wᵢ / (k + rankᵢ(d))
   * 3. Sort by RRF score descending
   * 4. Dedupe by memoryId (keep first occurrence)
   * 5. Apply RETRIEVAL_CANDIDATE_CAP
   */
  async findCandidates(filters: RetrievalFilters): Promise<Memory[]> {
    const sourceResults = await Promise.all(
      this.sources.map(({ source, role }) => this.fetchWithCap(source, role, filters)),
    );

    const fused = this.applyRRF(sourceResults);

    const seen = new Set<string>();
    const result: Memory[] = [];

    for (const memory of fused) {
      if (!seen.has(memory.id)) {
        seen.add(memory.id);
        result.push(memory);
        if (result.length >= RETRIEVAL_CANDIDATE_CAP) {
          break;
        }
      }
    }

    return result;
  }

  private async fetchWithCap(
    source: IRetrievalCandidateSource,
    role: RetrievalSourceRole,
    filters: RetrievalFilters,
  ): Promise<Memory[]> {
    const cap = getRrfSourceCap(role, this.activeRoles);
    return source.findCandidates({ ...filters, maxCandidates: cap });
  }

  /**
   * Apply Reciprocal Rank Fusion to merge ranked candidate lists.
   * Documents not present in a source get rank 0 and contribute 0 to score.
   */
  private applyRRF(sourceResults: Memory[][]): Memory[] {
    const rankMaps = sourceResults.map((results) => this.buildRankMap(results));
    const weights = this.sources.map(({ role }) => getRrfSourceWeight(role));

    const memoryIds = new Set<string>();
    for (const results of sourceResults) {
      for (const memory of results) {
        memoryIds.add(memory.id);
      }
    }

    const scores = new Map<string, number>();
    for (const memoryId of memoryIds) {
      let score = 0;
      for (let i = 0; i < rankMaps.length; i++) {
        const rank = rankMaps[i].get(memoryId) ?? 0;
        if (rank > 0) {
          score += weights[i] / (RRF_CONFIG.K + rank);
        }
      }
      scores.set(memoryId, score);
    }

    const allMemories = new Map<string, Memory>();
    for (const results of sourceResults) {
      for (const memory of results) {
        allMemories.set(memory.id, memory);
      }
    }

    const sorted = Array.from(memoryIds).sort((a, b) => {
      const scoreA = scores.get(a) ?? 0;
      const scoreB = scores.get(b) ?? 0;
      return scoreB - scoreA;
    });

    return sorted.map((id) => allMemories.get(id)!);
  }

  private buildRankMap(memories: Memory[]): Map<string, number> {
    const rankMap = new Map<string, number>();
    for (let i = 0; i < memories.length; i++) {
      rankMap.set(memories[i].id, i + 1);
    }
    return rankMap;
  }
}
