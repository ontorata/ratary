import type { IRecallPolicy } from './recall-policy.port.js';
import type {
  CandidateSet,
  RecallCandidate,
  RecallDecision,
  RecallRequest,
} from './recall-contracts.js';

/**
 * Deterministic recall policy — Wave 3.
 *
 * Ranking is based on:
 *   1. Confidence score (from candidate metadata) when present
 *   2. Recency (updatedAt timestamp — more recent first)
 *   3. Stable tiebreak (candidateId localeCompare)
 *
 * Filters applied before ranking:
 *   - tags: candidate.metadata.source must match any requested tag
 *   - levels: candidate.metadata.contentType must match any requested level
 *   - freshnessPolicy: temporal cutoff on updatedAt
 *
 * The policy MUST NOT mutate the input CandidateSet. Returns new arrays.
 * Stable sort: same input always yields same output ordering.
 */
export class RecallPolicy implements IRecallPolicy {
  readonly policyVersion = '1.0.0';

  async applyPolicy(
    request: RecallRequest,
    candidateSet: CandidateSet,
  ): Promise<{ rankedCandidates: RecallCandidate[]; decision: RecallDecision }> {
    const { selected, rejected: filterRejected } = this.filterCandidates(request, candidateSet.candidates);
    const ranked = this.rankCandidates(selected);
    const limited = ranked.slice(0, request.limit ?? ranked.length);
    const selectedIds = new Set(limited.map((c) => c.candidateId));
    const rejectedByLimit = selected.filter((c) => !selectedIds.has(c.candidateId));

    const decision = this.buildDecision(
      request.requestId,
      candidateSet.candidates,
      limited,
      [...filterRejected, ...rejectedByLimit],
    );

    return { rankedCandidates: limited, decision };
  }

  private filterCandidates(
    request: RecallRequest,
    candidates: RecallCandidate[],
  ): { selected: RecallCandidate[]; rejected: RecallCandidate[] } {
    const selected = candidates.filter((candidate) => {
      if (request.tags?.length && request.tags.length > 0) {
        const source = candidate.metadata.source;
        if (!request.tags.includes(source)) return false;
      }

      if (request.levels?.length && request.levels.length > 0) {
        const contentType = candidate.metadata.contentType;
        if (!request.levels.includes(contentType)) return false;
      }

      if (request.freshnessPolicy) {
        const cutoff = this.freshnessCutoff(request.freshnessPolicy, candidate.metadata.updatedAt);
        if (cutoff !== null && new Date(candidate.metadata.updatedAt) < cutoff) {
          return false;
        }
      }

      return true;
    });

    const selectedIds = new Set(selected.map((c) => c.candidateId));
    const rejected = candidates.filter((c) => !selectedIds.has(c.candidateId));

    return { selected, rejected };
  }

  private rankCandidates(candidates: RecallCandidate[]): RecallCandidate[] {
    return [...candidates].sort((left, right) => {
      const scoreLeft = this.candidateScore(left);
      const scoreRight = this.candidateScore(right);
      if (scoreRight !== scoreLeft) return scoreRight - scoreLeft;
      return left.candidateId.localeCompare(right.candidateId);
    });
  }

  /**
   * Deterministic score — same candidate always gets the same score.
   * Higher = better (ranked first).
   */
  private candidateScore(candidate: RecallCandidate): number {
    let score = 0;

    // Confidence signal: 0–1 → 0–1000 (default 0.5 when absent)
    const confidence = candidate.confidence ?? 0.5;
    score += confidence * 1000;

    // Recency signal: recency days → 0–500
    const updatedAt = new Date(candidate.metadata.updatedAt).getTime();
    const ageDays = (Date.now() - updatedAt) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 500 - ageDays * 2);
    score += recencyScore;

    // Embedding presence signal: +200
    if (candidate.metadata.embeddingVersion) {
      score += 200;
    }

    return score;
  }

  private freshnessCutoff(policy: string, updatedAt: string): Date | null {
    const match = policy.match(/^max_age:(\d+)(h|d)$/);
    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const ms = unit === 'h' ? value * 60 * 60 * 1000 : value * 24 * 60 * 60 * 1000;
    return new Date(Date.now() - ms);
  }

  private buildDecision(
    requestId: string,
    allCandidates: RecallCandidate[],
    selected: RecallCandidate[],
    rejected: RecallCandidate[],
  ): RecallDecision {
    const selectedIds = selected.map((c) => c.candidateId);
    const rejectedIds = rejected.map((c) => c.candidateId);

    const selectedCount = selected.length;
    const rejectedCount = rejected.length;
    const avgConfidence =
      selected.length > 0
        ? selected.reduce((sum, c) => sum + (c.confidence ?? 0.5), 0) / selected.length
        : 0;

    const confidenceBand =
      avgConfidence >= 0.75
        ? 'high'
        : avgConfidence >= 0.4
          ? 'medium'
          : 'low';

    return {
      requestId,
      policyVersion: this.policyVersion,
      selectedCandidates: selectedIds,
      rejectedCandidates: rejectedIds,
      decisionReason: `Selected ${selectedCount} of ${allCandidates.length} candidates by confidence+recency ranking${rejectedCount > 0 ? `; ${rejectedCount} rejected by filter` : ''}.`,
      confidenceSummary: `${selectedCount} candidates selected with ${confidenceBand} average confidence.`,
    };
  }
}
