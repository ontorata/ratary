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

/**
 * Conversation co-occurrence: same project + created within temporal window.
 * Models memories discussed in the same workspace session.
 */
export class ConversationCooccurrenceSource implements IRelationInferenceSource {
  readonly sourceId = 'conversation';

  infer(_scope: RelationInferenceScope, memories: readonly Memory[]): InferredRelationCandidate[] {
    const candidates: InferredRelationCandidate[] = [];

    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const source = memories[i];
        const target = memories[j];
        if (source.id === target.id) continue;
        if (!source.project || source.project !== target.project) continue;

        const gapDays = daysBetween(source.createdAt, target.createdAt);
        if (gapDays > TEMPORAL_PROXIMITY_DAYS) continue;

        const proximity = 1 - gapDays / TEMPORAL_PROXIMITY_DAYS;
        const confidence = TEMPORAL_PROXIMITY_CONFIDENCE * proximity * 0.85;

        candidates.push({
          sourceMemoryId: source.id,
          targetMemoryId: target.id,
          relation: 'related',
          weight: proximity,
          confidence,
          inferenceSource: 'conversation',
          evidence: { project: source.project, gapDays, proximity },
        });
      }
    }

    return candidates;
  }
}
