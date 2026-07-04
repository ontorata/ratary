import type { Memory } from '../../types/memory.js';
import type { IRelationInferenceSource } from '../irelation-inference-source.interface.js';
import type {
  InferredRelationCandidate,
  RelationInferenceScope,
} from '../relation-inference.types.js';
import {
  TEMPORAL_PROXIMITY_CONFIDENCE,
  TEMPORAL_PROXIMITY_DAYS,
} from '../relation-inference.constants.js';

function daysBetween(a: string, b: string): number {
  const ms = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return ms / (1000 * 60 * 60 * 24);
}

export class TemporalProximitySource implements IRelationInferenceSource {
  readonly sourceId = 'temporal';

  infer(_scope: RelationInferenceScope, memories: readonly Memory[]): InferredRelationCandidate[] {
    const candidates: InferredRelationCandidate[] = [];

    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const source = memories[i];
        const target = memories[j];
        if (source.id === target.id) continue;

        const gapDays = daysBetween(source.createdAt, target.createdAt);
        if (gapDays > TEMPORAL_PROXIMITY_DAYS) continue;

        const proximity = 1 - gapDays / TEMPORAL_PROXIMITY_DAYS;
        const confidence = TEMPORAL_PROXIMITY_CONFIDENCE * proximity;

        candidates.push({
          sourceMemoryId: source.id,
          targetMemoryId: target.id,
          relation: 'related',
          weight: 0.5,
          confidence,
          inferenceSource: 'temporal',
          evidence: { gapDays, proximity },
        });
      }
    }

    return candidates;
  }
}
