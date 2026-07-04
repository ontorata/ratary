import type { Memory } from '../types/memory.js';
import type {
  InferredRelationCandidate,
  RelationInferenceScope,
} from './relation-inference.types.js';

export interface IRelationInferenceSource {
  readonly sourceId: string;
  infer(scope: RelationInferenceScope, memories: readonly Memory[]): InferredRelationCandidate[];
}
