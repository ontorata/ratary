import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IRelationEvidenceStore } from '../../inference/irelation-evidence-store.port.js';
import type {
  RelationInferenceScope,
  ScoredInferredRelation,
} from '../../inference/relation-inference.types.js';

export class SqlRelationEvidenceStore implements IRelationEvidenceStore {
  constructor(private readonly db: ISqlDatabase) {}

  async append(scope: RelationInferenceScope, relation: ScoredInferredRelation): Promise<void> {
    await this.db.execute(
      `INSERT INTO relation_inference_evidence (
        id, owner_id, workspace_id, source_memory_id, target_memory_id,
        relation, inference_source, confidence, payload, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        scope.ownerId,
        scope.workspaceId ?? null,
        relation.sourceMemoryId,
        relation.targetMemoryId,
        relation.relation,
        relation.inferenceSource,
        relation.finalConfidence,
        JSON.stringify(relation.evidence),
        new Date().toISOString(),
      ],
    );
  }
}
