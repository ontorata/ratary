import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import { DefaultRelationScoringPolicy } from '../inference/default-relation-scoring-policy.js';
import { RelationInferenceOrchestrator } from '../inference/relation-inference-orchestrator.js';
import { NoOpRelationInferenceOrchestrator } from '../inference/noop-relation-inference-orchestrator.js';
import { ProjectCooccurrenceSource } from '../inference/sources/project-cooccurrence-source.js';
import { SharedTagSource } from '../inference/sources/shared-tag-source.js';
import { TemporalProximitySource } from '../inference/sources/temporal-proximity-source.js';
import { SqlRelationEvidenceStore } from '../infrastructure/inference/sql-relation-evidence-store.js';
import type { IRelationInferenceOrchestrator } from '../inference/irelation-inference-orchestrator.interface.js';

export interface RelationInferencePorts {
  enabled: boolean;
  orchestrator: IRelationInferenceOrchestrator;
}

/**
 * Composition root for Phase 8.7 graph relation inference (ADR-041).
 * Gated by RELATION_INFERENCE_ENABLED; evidence store when RELATION_INFERENCE_STORE_PROVIDER=sql.
 */
export function createRelationInferencePorts(sql: ISqlDatabase, env: Env): RelationInferencePorts {
  if (!env.RELATION_INFERENCE_ENABLED) {
    return { enabled: false, orchestrator: new NoOpRelationInferenceOrchestrator() };
  }

  const memoryReader = new MemoryRepository(sql);
  const relationRepository = new MemoryRelationRepository(sql);
  const evidenceStore =
    env.RELATION_INFERENCE_STORE_PROVIDER === 'sql' ? new SqlRelationEvidenceStore(sql) : undefined;

  return {
    enabled: true,
    orchestrator: new RelationInferenceOrchestrator({
      memoryReader,
      relationRepository,
      scoringPolicy: new DefaultRelationScoringPolicy(),
      evidenceStore,
      sources: [
        new ProjectCooccurrenceSource(),
        new SharedTagSource(),
        new TemporalProximitySource(),
      ],
    }),
  };
}
