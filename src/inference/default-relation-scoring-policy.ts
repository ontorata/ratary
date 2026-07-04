import { RELATION_INFERENCE_MIN_CONFIDENCE } from './relation-inference.constants.js';
import type { IRelationScoringPolicy } from './irelation-scoring-policy.interface.js';
import type {
  InferredRelationCandidate,
  ScoredInferredRelation,
} from './relation-inference.types.js';

function edgeKey(candidate: InferredRelationCandidate): string {
  return `${candidate.sourceMemoryId}:${candidate.targetMemoryId}:${candidate.relation}`;
}

export class DefaultRelationScoringPolicy implements IRelationScoringPolicy {
  score(candidates: readonly InferredRelationCandidate[]): ScoredInferredRelation[] {
    const merged = new Map<string, ScoredInferredRelation>();

    for (const candidate of candidates) {
      const key = edgeKey(candidate);
      const existing = merged.get(key);
      if (!existing) {
        merged.set(key, {
          ...candidate,
          finalWeight: candidate.weight,
          finalConfidence: candidate.confidence,
        });
        continue;
      }

      merged.set(key, {
        ...existing,
        finalWeight: Math.min(10, existing.finalWeight + candidate.weight * 0.5),
        finalConfidence: Math.max(existing.finalConfidence, candidate.confidence),
        evidence: {
          ...existing.evidence,
          [`${candidate.inferenceSource}_support`]: candidate.evidence,
        },
      });
    }

    return [...merged.values()].filter(
      (item) => item.finalConfidence >= RELATION_INFERENCE_MIN_CONFIDENCE,
    );
  }
}
