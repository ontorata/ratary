import type { IMemoryReader } from '../repositories/memory.repository.interface.js';
import type { IMemoryRelationRepository } from '../repositories/memory-relation.repository.interface.js';
import type { IRelationInferenceOrchestrator } from './irelation-inference-orchestrator.interface.js';
import type { IRelationInferenceSource } from './irelation-inference-source.interface.js';
import type { IRelationScoringPolicy } from './irelation-scoring-policy.interface.js';
import type { IRelationEvidenceStore } from './irelation-evidence-store.port.js';
import { RELATION_INFERENCE_MAX_CANDIDATES } from './relation-inference.constants.js';
import type {
  RelationInferenceRunOptions,
  RelationInferenceRunReport,
  RelationInferenceScope,
} from './relation-inference.types.js';
import { workspaceIdFromScope } from '../repositories/repository-scope.js';

export interface RelationInferenceOrchestratorDeps {
  memoryReader: IMemoryReader;
  relationRepository: IMemoryRelationRepository;
  scoringPolicy: IRelationScoringPolicy;
  evidenceStore?: IRelationEvidenceStore;
  sources: IRelationInferenceSource[];
}

export class RelationInferenceOrchestrator implements IRelationInferenceOrchestrator {
  constructor(private readonly deps: RelationInferenceOrchestratorDeps) {}

  async run(
    scope: RelationInferenceScope,
    options: RelationInferenceRunOptions,
  ): Promise<RelationInferenceRunReport> {
    const workspaceId = workspaceIdFromScope(scope);
    let memories = await this.deps.memoryReader.findAllByOwner(scope.ownerId, workspaceId);

    if (options.projectId) {
      memories = memories.filter(
        (memory) => memory.projectId === options.projectId || memory.project === options.projectId,
      );
    }

    const bySource: Record<string, number> = {};
    const rawCandidates = this.deps.sources.flatMap((source) => {
      const found = source.infer(scope, memories);
      bySource[source.sourceId] = found.length;
      return found;
    });

    const scored = this.deps.scoringPolicy
      .score(rawCandidates)
      .slice(0, options.limit ?? RELATION_INFERENCE_MAX_CANDIDATES);

    let relationsCreated = 0;
    let relationsUpdated = 0;
    let relationsSkippedManual = 0;

    if (!options.dryRun) {
      for (const relation of scored) {
        const outcome = await this.deps.relationRepository.upsertInferred({
          sourceMemoryId: relation.sourceMemoryId,
          targetMemoryId: relation.targetMemoryId,
          relation: relation.relation,
          ownerId: scope.ownerId,
          weight: relation.finalWeight,
          confidence: relation.finalConfidence,
          metadata: {
            inferenceSource: relation.inferenceSource,
            evidence: relation.evidence,
          },
        });

        if (outcome === 'created') relationsCreated++;
        else if (outcome === 'updated') relationsUpdated++;
        else relationsSkippedManual++;

        if (this.deps.evidenceStore) {
          await this.deps.evidenceStore.append(scope, relation);
        }
      }
    }

    return {
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      dryRun: options.dryRun,
      candidatesFound: scored.length,
      relationsCreated,
      relationsUpdated,
      relationsSkippedManual,
      bySource,
    };
  }
}
