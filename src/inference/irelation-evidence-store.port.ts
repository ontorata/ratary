import type { ScoredInferredRelation, RelationInferenceScope } from './relation-inference.types.js';

export interface IRelationEvidenceStore {
  append(scope: RelationInferenceScope, relation: ScoredInferredRelation): Promise<void>;
}
