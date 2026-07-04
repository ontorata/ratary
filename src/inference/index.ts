export type {
  InferenceSourceId,
  InferredRelationCandidate,
  ScoredInferredRelation,
  RelationInferenceRunOptions,
  RelationInferenceRunReport,
  RelationInferenceScope,
} from './relation-inference.types.js';
export type { IRelationInferenceOrchestrator } from './irelation-inference-orchestrator.interface.js';
export type { IRelationInferenceSource } from './irelation-inference-source.interface.js';
export type { IRelationScoringPolicy } from './irelation-scoring-policy.interface.js';
export type { IRelationEvidenceStore } from './irelation-evidence-store.port.js';
export {
  RELATION_INFERENCE_MIN_CONFIDENCE,
  RELATION_INFERENCE_MAX_CANDIDATES,
  TEMPORAL_PROXIMITY_DAYS,
} from './relation-inference.constants.js';
export { DefaultRelationScoringPolicy } from './default-relation-scoring-policy.js';
export { RelationInferenceOrchestrator } from './relation-inference-orchestrator.js';
export { NoOpRelationInferenceOrchestrator } from './noop-relation-inference-orchestrator.js';
export { ProjectCooccurrenceSource } from './sources/project-cooccurrence-source.js';
export { SharedTagSource } from './sources/shared-tag-source.js';
export { TemporalProximitySource } from './sources/temporal-proximity-source.js';
