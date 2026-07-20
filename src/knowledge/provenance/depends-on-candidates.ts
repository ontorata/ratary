/**
 * Phase 36 / ADR-069 T6 — findings-only candidates from existing depends_on edges.
 * Correlation ≠ causation: never auto-writes caused_by (v1).
 */
import { PROVENANCE_VERSION, type ProvenanceEvidence } from '../../types/provenance.js';

export interface DependsOnEdgeInput {
  id: string;
  sourceMemoryId: string;
  targetMemoryId: string;
  relation: string;
}

export interface ProvenanceCandidateFinding {
  sourceMemoryId: string;
  targetMemoryId: string;
  suggestedRelation: 'caused_by';
  dependsOnRelationId: string;
  evidence: ProvenanceEvidence;
}

/**
 * Pure: map depends_on edges to provenance candidate findings with I2 evidence.
 * Does not mutate input; never promotes to stored causation.
 */
export function collectDependsOnProvenanceCandidates(
  edges: readonly DependsOnEdgeInput[],
): ProvenanceCandidateFinding[] {
  const findings: ProvenanceCandidateFinding[] = [];
  for (const edge of edges) {
    if (edge.relation !== 'depends_on') continue;
    findings.push({
      sourceMemoryId: edge.sourceMemoryId,
      targetMemoryId: edge.targetMemoryId,
      suggestedRelation: 'caused_by',
      dependsOnRelationId: edge.id,
      evidence: {
        provenanceVersion: PROVENANCE_VERSION,
        rule: 'depends_on_candidate',
        matched: edge.id,
      },
    });
  }
  // Deterministic: edge id ASC
  findings.sort((a, b) => a.dependsOnRelationId.localeCompare(b.dependsOnRelationId));
  return findings;
}
