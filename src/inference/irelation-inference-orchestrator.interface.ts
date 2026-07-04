import type {
  RelationInferenceRunOptions,
  RelationInferenceRunReport,
  RelationInferenceScope,
} from './relation-inference.types.js';

export interface IRelationInferenceOrchestrator {
  run(
    scope: RelationInferenceScope,
    options: RelationInferenceRunOptions,
  ): Promise<RelationInferenceRunReport>;
}
