import type { Memory } from '../../types/memory.js';
import type { IRelationInferenceSource } from '../irelation-inference-source.interface.js';
import type {
  InferredRelationCandidate,
  RelationInferenceScope,
} from '../relation-inference.types.js';
import { PROJECT_COOCCURRENCE_CONFIDENCE } from '../relation-inference.constants.js';

export class ProjectCooccurrenceSource implements IRelationInferenceSource {
  readonly sourceId = 'project';

  infer(_scope: RelationInferenceScope, memories: readonly Memory[]): InferredRelationCandidate[] {
    const byProject = new Map<string, Memory[]>();

    for (const memory of memories) {
      const key = memory.projectId || memory.project || '';
      if (!key) continue;
      const group = byProject.get(key) ?? [];
      group.push(memory);
      byProject.set(key, group);
    }

    const candidates: InferredRelationCandidate[] = [];

    for (const [projectId, group] of byProject) {
      if (group.length < 2) continue;

      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const source = group[i];
          const target = group[j];
          if (source.id === target.id) continue;

          candidates.push({
            sourceMemoryId: source.id,
            targetMemoryId: target.id,
            relation: 'related',
            weight: 1,
            confidence: PROJECT_COOCCURRENCE_CONFIDENCE,
            inferenceSource: 'project',
            evidence: {
              projectId,
              sourceCodename: source.codename,
              targetCodename: target.codename,
            },
          });
        }
      }
    }

    return candidates;
  }
}
