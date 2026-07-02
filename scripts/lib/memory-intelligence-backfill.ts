import { slugify } from '../../src/knowledge/slug.generator.js';
import { computeSemanticHash } from '../../src/memory/semantic-hash.js';
import { DEFAULT_MEMORY_LEVEL, type MemoryLevel } from '../../src/types/memory-level.js';

export interface IntelligenceBackfillInput {
  title: string;
  summary: string;
  content: string;
  project: string;
  level?: MemoryLevel;
}

export interface IntelligenceBackfillPatch {
  projectId: string;
  level: MemoryLevel;
  semanticHash: string;
}

export function buildIntelligenceBackfillPatch(
  memory: IntelligenceBackfillInput,
): IntelligenceBackfillPatch {
  const projectId = slugify(memory.project ?? '');
  const level = memory.level ?? DEFAULT_MEMORY_LEVEL;
  const semanticHash = computeSemanticHash(memory.title, memory.summary, memory.content);

  return { projectId, level, semanticHash };
}
