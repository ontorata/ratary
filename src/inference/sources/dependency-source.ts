import type { Memory } from '../../types/memory.js';
import type { IRelationInferenceSource } from '../irelation-inference-source.interface.js';
import type {
  InferredRelationCandidate,
  RelationInferenceScope,
} from '../relation-inference.types.js';

const DEPENDENCY_TAG_PREFIX = 'depends:';
const DEPENDENCY_CONFIDENCE = 0.7;

/**
 * Dependency source: tag `depends:<codename>` links to target memory codename in scope.
 */
export class DependencySource implements IRelationInferenceSource {
  readonly sourceId = 'dependency';

  infer(_scope: RelationInferenceScope, memories: readonly Memory[]): InferredRelationCandidate[] {
    const byCodename = new Map<string, Memory>();
    for (const memory of memories) {
      if (memory.codename) {
        byCodename.set(memory.codename.toLowerCase(), memory);
      }
    }

    const candidates: InferredRelationCandidate[] = [];

    for (const source of memories) {
      for (const tag of source.tags) {
        if (!tag.startsWith(DEPENDENCY_TAG_PREFIX)) continue;
        const targetCodename = tag.slice(DEPENDENCY_TAG_PREFIX.length).trim().toLowerCase();
        const target = byCodename.get(targetCodename);
        if (!target || target.id === source.id) continue;

        candidates.push({
          sourceMemoryId: source.id,
          targetMemoryId: target.id,
          relation: 'depends_on',
          weight: 1,
          confidence: DEPENDENCY_CONFIDENCE,
          inferenceSource: 'dependency',
          evidence: { tag, targetCodename },
        });
      }
    }

    return candidates;
  }
}
