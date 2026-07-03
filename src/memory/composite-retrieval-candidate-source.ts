import type { Memory } from '../types/memory.js';
import type { RetrievalFilters } from '../repositories/memory.repository.interface.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import { RRF_CONFIG, RETRIEVAL_CANDIDATE_CAP } from '../search/ranking.config.js';

/**
 * Composite retrieval candidate source that merges candidates from multiple
 * IRetrievalCandidateSource implementations using Reciprocal Rank Fusion (RRF).
 *
 * @see ADR-001 Multi-Source Retrieval
 */
export class CompositeRetrievalCandidateSource implements IRetrievalCandidateSource {
  constructor(private readonly sources: IRetrievalCandidateSource[]) {}

  /**
   * Find candidates by merging ranked results from all sources using RRF.
   *
   * Algorithm:
   * 1. Fetch up to SOURCE_CAPS.sql candidates from SQL source
   * 2. Fetch up to SOURCE_CAPS.vector candidates from vector source
   * 3. For each unique memory, compute RRF score: Σᵢ 1 / (k + rankᵢ(d))
   * 4. Sort by RRF score descending
   * 5. Dedupe by memoryId (keep first occurrence)
   * 6. Apply RETRIEVAL_CANDIDATE_CAP
   */
  async findCandidates(filters: RetrievalFilters): Promise<Memory[]> {
    // Fetch candidates from all sources in parallel
    const sourceResults = await Promise.all(
      this.sources.map((source) => this.fetchWithCap(source, filters)),
    );

    // Apply RRF to merge ranked results
    const fused = this.applyRRF(sourceResults);

    // Apply final cap and dedupe
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

  /**
   * Fetch candidates from a source, respecting per-source cap.
   */
  private async fetchWithCap(
    source: IRetrievalCandidateSource,
    filters: RetrievalFilters,
  ): Promise<Memory[]> {
    // Determine cap based on source index (0 = SQL, 1+ = vector)
    const cap = source === this.sources[0] ? RRF_CONFIG.SOURCE_CAPS.sql : RRF_CONFIG.SOURCE_CAPS.vector;
    const cappedFilters = { ...filters, maxCandidates: cap };
    return source.findCandidates(cappedFilters);
  }

  /**
   * Apply Reciprocal Rank Fusion to merge ranked candidate lists.
   * Documents not present in a source get rank 0 and contribute 0 to score.
   * Uses weighted RRF: score = Σᵢ wᵢ / (k + rankᵢ(d))
   */
  private applyRRF(sourceResults: Memory[][]): Memory[] {
    // Build rank maps for each source
    const rankMaps = sourceResults.map((results) => this.buildRankMap(results));

    // Get source weights (default 1.0 for any additional sources)
    const weights = [
      RRF_CONFIG.SOURCE_WEIGHTS.sql,
      RRF_CONFIG.SOURCE_WEIGHTS.vector,
      ...Array(Math.max(0, sourceResults.length - 2)).fill(1.0),
    ];

    // Build union of all unique memoryIds
    const memoryIds = new Set<string>();
    for (const results of sourceResults) {
      for (const memory of results) {
        memoryIds.add(memory.id);
      }
    }

    // Compute weighted RRF score for each memory
    const scores = new Map<string, number>();
    for (const memoryId of memoryIds) {
      let score = 0;
      for (let i = 0; i < rankMaps.length; i++) {
        const rank = rankMaps[i].get(memoryId) ?? 0;
        if (rank > 0) {
          const weight = weights[i] ?? 1.0;
          score += weight / (RRF_CONFIG.K + rank);
        }
      }
      scores.set(memoryId, score);
    }

    // Collect all memories for sorting
    const allMemories = new Map<string, Memory>();
    for (const results of sourceResults) {
      for (const memory of results) {
        allMemories.set(memory.id, memory);
      }
    }

    // Sort by RRF score descending
    const sorted = Array.from(memoryIds).sort((a, b) => {
      const scoreA = scores.get(a) ?? 0;
      const scoreB = scores.get(b) ?? 0;
      return scoreB - scoreA;
    });

    return sorted.map((id) => allMemories.get(id)!);
  }

  /**
   * Build a rank map from a ranked list of memories.
   * Returns Map of memoryId -> rank (1-based).
   */
  private buildRankMap(memories: Memory[]): Map<string, number> {
    const rankMap = new Map<string, number>();
    for (let i = 0; i < memories.length; i++) {
      rankMap.set(memories[i].id, i + 1);
    }
    return rankMap;
  }
}
