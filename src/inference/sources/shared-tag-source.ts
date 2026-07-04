import type { Memory } from '../../types/memory.js';
import type { IRelationInferenceSource } from '../irelation-inference-source.interface.js';
import type {
  InferredRelationCandidate,
  RelationInferenceScope,
} from '../relation-inference.types.js';
import { SHARED_TAG_BASE_CONFIDENCE } from '../relation-inference.constants.js';

export class SharedTagSource implements IRelationInferenceSource {
  readonly sourceId = 'shared_tag';

  infer(_scope: RelationInferenceScope, memories: readonly Memory[]): InferredRelationCandidate[] {
    const candidates: InferredRelationCandidate[] = [];

    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const source = memories[i];
        const target = memories[j];
        if (source.id === target.id) continue;

        const sourceTags = new Set(source.tags);
        const shared = target.tags.filter((tag) => sourceTags.has(tag));
        if (shared.length === 0) continue;

        const overlapRatio = shared.length / Math.max(source.tags.length, target.tags.length, 1);
        const confidence = Math.min(1, SHARED_TAG_BASE_CONFIDENCE + overlapRatio * 0.4);

        candidates.push({
          sourceMemoryId: source.id,
          targetMemoryId: target.id,
          relation: 'related',
          weight: shared.length,
          confidence,
          inferenceSource: 'shared_tag',
          evidence: { sharedTags: shared, overlapRatio },
        });
      }
    }

    return candidates;
  }
}
