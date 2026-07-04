import type { IRelationInferenceOrchestrator } from './irelation-inference-orchestrator.interface.js';
import type {
  RelationInferenceRunOptions,
  RelationInferenceRunReport,
  RelationInferenceScope,
} from './relation-inference.types.js';

export class NoOpRelationInferenceOrchestrator implements IRelationInferenceOrchestrator {
  async run(
    scope: RelationInferenceScope,
    options: RelationInferenceRunOptions,
  ): Promise<RelationInferenceRunReport> {
    return {
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      dryRun: options.dryRun,
      candidatesFound: 0,
      relationsCreated: 0,
      relationsUpdated: 0,
      relationsSkippedManual: 0,
      bySource: {},
    };
  }
}
