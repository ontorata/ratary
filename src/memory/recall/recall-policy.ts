import type { IRecallPolicy } from './recall-policy.port.js';
import type {
  CandidateSet,
  RecallCandidate,
  RecallDecision,
  RecallDecisionCandidateOutcome,
  RecallRequest,
  RecallSignalReason,
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
 * Retrieval is the representation of facts (raw candidates).
 * Ranking is the interpretation of those facts (decision with auditable reasons).
 *
 * The policy MUST NOT mutate the input CandidateSet. Returns new arrays.
 * Stable sort: same input always yields same output ordering.
 */
export class RecallPolicy implements IRecallPolicy {
  readonly policyVersion = '1.0.0';
  readonly policyName = 'confidence-recency-embedding';

  constructor(private readonly nowMs: () => number = () => Date.now()) {}

  async applyPolicy(
    request: RecallRequest,
    candidateSet: CandidateSet,
  ): Promise<{ rankedCandidates: RecallCandidate[]; decision: RecallDecision }> {
    const started = this.nowMs();
    const evaluationNow = started;
    const { selected, rejected: filterRejected, filterReasons } = this.filterCandidates(
      request,
      candidateSet.candidates,
      evaluationNow,
    );
    const { ranked, scores } = this.rankCandidates(selected, evaluationNow);
    const limited = ranked.slice(0, request.limit ?? ranked.length);
    const selectedIds = new Set(limited.map((c) => c.candidateId));
    const rejectedByLimit = selected.filter((c) => !selectedIds.has(c.candidateId));

    const executionTimeMs = this.nowMs() - started;

    const decision = this.buildDecision(
      request.requestId,
      candidateSet.candidates,
      limited,
      [...filterRejected, ...rejectedByLimit],
      scores,
      filterReasons,
      { executionTimeMs },
    );

    return { rankedCandidates: limited, decision };
  }

  private filterCandidates(
    request: RecallRequest,
    candidates: RecallCandidate[],
    evaluationNow: number,
  ): {
    selected: RecallCandidate[];
    rejected: RecallCandidate[];
    filterReasons: Map<string, RecallSignalReason[]>;
  } {
    const filterReasons = new Map<string, RecallSignalReason[]>();
    const selected: RecallCandidate[] = [];
    const rejected: RecallCandidate[] = [];

    for (const candidate of candidates) {
      const reasons: RecallSignalReason[] = [];
      let passed = true;

      // Always track this candidate — even empty reasons = "passed all filters"
      filterReasons.set(candidate.candidateId, reasons);

      if (request.tags?.length) {
        const source = candidate.metadata.source;
        if (request.tags.includes(source)) {
          reasons.push({ reason: `tag_match:${source}`, weight: 0, contribution: 0 });
        } else {
          reasons.push({ reason: `tag_filter:${source}`, weight: 0, contribution: 0 });
          passed = false;
        }
      }

      if (request.levels?.length) {
        const contentType = candidate.metadata.contentType;
        if (request.levels.includes(contentType)) {
          reasons.push({ reason: `level_match:${contentType}`, weight: 0, contribution: 0 });
        } else {
          reasons.push({ reason: `level_filter:${contentType}`, weight: 0, contribution: 0 });
          passed = false;
        }
      }

      if (request.freshnessPolicy) {
        const cutoff = this.freshnessCutoff(request.freshnessPolicy, evaluationNow);
        if (cutoff !== null && new Date(candidate.metadata.updatedAt) < cutoff) {
          reasons.push({
            reason: `freshness_filter:${request.freshnessPolicy}`,
            weight: 0,
            contribution: 0,
          });
          passed = false;
        } else {
          reasons.push({
            reason: `freshness_pass:${request.freshnessPolicy}`,
            weight: 0,
            contribution: 0,
          });
        }
      }

      if (passed) {
        selected.push(candidate);
      } else {
        rejected.push(candidate);
      }
    }

    return { selected, rejected, filterReasons };
  }

  private rankCandidates(
    candidates: RecallCandidate[],
    evaluationNow: number,
  ): { ranked: RecallCandidate[]; scores: Map<string, ScoredCandidate> } {
    const scored = candidates.map((c) => ({
      candidate: c,
      score: this.computeScore(c, evaluationNow),
    }));
    const ranked = [...scored].sort((left, right) => {
      if (right.score.total !== left.score.total) return right.score.total - left.score.total;
      return left.candidate.candidateId.localeCompare(right.candidate.candidateId);
    });
    const scores = new Map(scored.map((s) => [s.candidate.candidateId, s.score]));
    return { ranked: ranked.map((s) => s.candidate), scores };
  }

  private computeScore(candidate: RecallCandidate, evaluationNow: number): ScoredCandidate {
    const signals: RecallSignalReason[] = [];

    // Confidence signal: 0–1 → 0–1000 (default 0.5 when absent)
    const confidence = candidate.confidence ?? 0.5;
    const confidenceContribution = confidence * 1000;
    signals.push({
      reason: candidate.confidence !== undefined ? 'confidence' : 'confidence_default',
      weight: 1,
      contribution: confidenceContribution,
    });

    // Recency signal: recency days → 0–500 (evaluationNow is request-scoped for determinism)
    const updatedAt = new Date(candidate.metadata.updatedAt).getTime();
    const ageDays = (evaluationNow - updatedAt) / (1000 * 60 * 60 * 24);
    const recencyContribution = Math.max(0, 500 - ageDays * 2);
    signals.push({
      reason: 'recency',
      weight: 1,
      contribution: recencyContribution,
    });

    // Embedding presence signal: +200
    if (candidate.metadata.embeddingVersion) {
      signals.push({
        reason: 'has_embedding',
        weight: 1,
        contribution: 200,
      });
    } else {
      signals.push({ reason: 'no_embedding', weight: 1, contribution: 0 });
    }

    const total = signals.reduce((sum, signal) => sum + signal.contribution, 0);
    return { signals, total };
  }

  private freshnessCutoff(policy: string, evaluationNow: number): Date | null {
    const match = policy.match(/^max_age:(\d+)(h|d)$/);
    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const ms = unit === 'h' ? value * 60 * 60 * 1000 : value * 24 * 60 * 60 * 1000;
    return new Date(evaluationNow - ms);
  }

  private buildDecision(
    requestId: string,
    allCandidates: RecallCandidate[],
    selected: RecallCandidate[],
    rejected: RecallCandidate[],
    scores: Map<string, ScoredCandidate>,
    filterReasons: Map<string, RecallSignalReason[]>,
    execution: { executionTimeMs: number },
  ): RecallDecision {
    const candidateOutcomes: RecallDecisionCandidateOutcome[] = [];

    for (const c of allCandidates) {
      // Filter-rejected if filterReasons contains a filter_ reason
      const reasons = filterReasons.get(c.candidateId) ?? [];
      const isFilterRejected = reasons.some(
        (r) => r.reason.startsWith('tag_filter') || r.reason.startsWith('level_filter') || r.reason.startsWith('freshness_filter'),
      );
      // Selected if it passed filters AND is in the ranked+limited result
      const isInRanked = selected.some((s) => s.candidateId === c.candidateId);

      let outcome: RecallDecisionCandidateOutcome['outcome'];
      if (isInRanked) {
        outcome = 'selected';
      } else if (isFilterRejected) {
        outcome = 'rejected_filter';
      } else if (scores.has(c.candidateId)) {
        // Passed filters and was scored, but excluded by limit cap
        outcome = 'rejected_limit';
      } else {
        outcome = 'rejected_rank';
      }

      // Score signals only available for filter-passed candidates (in `scores`)
      const scored = scores.get(c.candidateId);
      const rankingSignals = scored ? scored.signals : [];

      candidateOutcomes.push({
        candidateId: c.candidateId,
        outcome,
        reasons: [...reasons, ...rankingSignals],
        score: scored?.total ?? 0,
      });
    }

    // Primary reason: top contributing ranking signal among selected candidates
    const topSelected = candidateOutcomes
      .filter((o) => o.outcome === 'selected')
      .sort((a, b) => b.score - a.score)[0];
    const primaryReason = topSelected
      ? (topSelected.reasons
          .filter(
            (s) =>
              !s.reason.startsWith('tag_') &&
              !s.reason.startsWith('level_') &&
              !s.reason.startsWith('freshness_') &&
              s.contribution > 0,
          )
          .sort((a, b) => b.contribution - a.contribution)[0]?.reason ?? 'confidence')
      : 'none';

    const selectedCount = selected.length;
    const rejectedCount = rejected.length;
    const avgConfidence =
      selected.length > 0
        ? selected.reduce((sum, c) => sum + (c.confidence ?? 0.5), 0) / selected.length
        : 0;

    const confidenceBand =
      avgConfidence >= 0.75 ? 'high' : avgConfidence >= 0.4 ? 'medium' : 'low';

    const selectedIds = selected.map((c) => c.candidateId);
    const rejectedIds = rejected.map((c) => c.candidateId);

    return {
      requestId,
      policyVersion: this.policyVersion,
      selectedCandidates: selectedIds,
      rejectedCandidates: rejectedIds,
      decisionReason: `Selected ${selectedCount} of ${allCandidates.length} candidates by confidence+recency ranking${rejectedCount > 0 ? `; ${rejectedCount} rejected by filter` : ''}.`,
      confidenceSummary: `${selectedCount} candidates selected with ${confidenceBand} average confidence.`,
      candidateOutcomes,
      policyExecution: {
        policyName: this.policyName,
        executionTimeMs: execution.executionTimeMs,
        candidatesScored: allCandidates.length,
        candidatesSelected: selectedCount,
        primaryReason,
      },
    };
  }
}

interface ScoredCandidate {
  signals: RecallSignalReason[];
  total: number;
}
