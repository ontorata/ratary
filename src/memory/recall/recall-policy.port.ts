import type {
  CandidateSet,
  RecallCandidate,
  RecallDecision,
  RecallRequest,
} from './recall-contracts.js';

/**
 * Applies tenant-safe recall rules and ranking signals.
 * Ranking behavior is introduced in Wave 3; Wave 1 only defines the port.
 */
export interface IRecallPolicy {
  readonly policyVersion: string;
  applyPolicy(
    request: RecallRequest,
    candidateSet: CandidateSet,
  ): Promise<{
    rankedCandidates: RecallCandidate[];
    decision: RecallDecision;
  }>;
}
