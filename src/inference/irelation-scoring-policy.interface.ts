import type {
  InferredRelationCandidate,
  ScoredInferredRelation,
} from './relation-inference.types.js';

export interface IRelationScoringPolicy {
  score(candidates: readonly InferredRelationCandidate[]): ScoredInferredRelation[];
}
