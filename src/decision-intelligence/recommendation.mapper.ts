import type { RecallCandidate, RecallResult } from '../memory/recall/recall-contracts.js';

export type RecommendationCard = Readonly<{
  cardId: string;
  title: string;
  advisory: true;
  memoryId?: string;
  sourceReference: string;
  confidence?: number;
  evidenceRefs: string[];
  reason: string;
}>;

export function mapRecallResultToRecommendationCards(result: RecallResult): RecommendationCard[] {
  return result.rankedCandidates.map((candidate, index) =>
    mapCandidateToCard(candidate, index, result.traceId),
  );
}

function mapCandidateToCard(
  candidate: RecallCandidate,
  index: number,
  traceId: string,
): RecommendationCard {
  const memoryId = candidate.memoryId ?? candidate.metadata.sourceId;
  return {
    cardId: `${traceId}:${index}`,
    title: candidate.sourceReference || memoryId,
    advisory: true,
    memoryId,
    sourceReference: candidate.sourceReference,
    confidence: candidate.confidence,
    evidenceRefs: [memoryId, candidate.candidateId],
    reason: `Recall trace ${traceId} — ranked #${index + 1} (${candidate.metadata.source})`,
  };
}
