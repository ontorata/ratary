import type { Memory } from '../../types/memory.js';
import type { IRelationInferenceSource } from '../irelation-inference-source.interface.js';
import type {
  InferredRelationCandidate,
  RelationInferenceScope,
} from '../relation-inference.types.js';

const SEMANTIC_SIMILARITY_BASE = 0.45;

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/** Infers `related` edges from title/token overlap and shared tags (deterministic, no LLM). */
export class SemanticSimilaritySource implements IRelationInferenceSource {
  readonly sourceId = 'semantic_similarity';

  infer(_scope: RelationInferenceScope, memories: readonly Memory[]): InferredRelationCandidate[] {
    const candidates: InferredRelationCandidate[] = [];

    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const source = memories[i];
        const target = memories[j];
        if (source.id === target.id) continue;

        const titleOverlap = jaccard(tokenize(source.title), tokenize(target.title));
        const tagOverlap = jaccard(new Set(source.tags), new Set(target.tags));
        const similarity = Math.max(titleOverlap, tagOverlap * 0.9);
        if (similarity < 0.25) continue;

        const confidence = Math.min(1, SEMANTIC_SIMILARITY_BASE + similarity * 0.5);

        candidates.push({
          sourceMemoryId: source.id,
          targetMemoryId: target.id,
          relation: 'related',
          weight: similarity,
          confidence,
          inferenceSource: 'semantic_similarity',
          evidence: { titleOverlap, tagOverlap, similarity },
        });
      }
    }

    return candidates;
  }
}
