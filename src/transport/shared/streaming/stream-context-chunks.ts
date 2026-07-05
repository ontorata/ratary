import type { BuildContextRequest, BuildContextResult } from '../../../memory/context.service.js';
import type { ContextChunk } from './context-chunk.types.js';

/** Converts a built context result into ordered stream chunks (shared by gRPC / handlers). */
export function* chunksFromBuildContextResult(result: BuildContextResult): Generator<ContextChunk> {
  let sequence = 0;

  yield {
    sequence: sequence++,
    type: 'metadata',
    payload: { totalCandidates: result.totalCandidates, retrievalPlan: result.retrievalPlan },
  };

  for (const memory of result.memories) {
    yield {
      sequence: sequence++,
      type: 'memory',
      payload: memory,
    };
  }

  yield {
    sequence: sequence++,
    type: 'done',
    payload: { context: result.context },
  };
}

export async function* streamContextChunks(
  build: () => Promise<BuildContextResult>,
): AsyncIterable<ContextChunk> {
  const result = await build();
  yield* chunksFromBuildContextResult(result);
}

export function buildContextRequestFromQuery(query: Record<string, unknown>): BuildContextRequest {
  const tags = query.tags;
  const levels = query.levels;
  return {
    query: typeof query.query === 'string' ? query.query : undefined,
    projectId: typeof query.projectId === 'string' ? query.projectId : undefined,
    tags: Array.isArray(tags) ? tags.map(String) : typeof tags === 'string' ? [tags] : undefined,
    levels: Array.isArray(levels) ? (levels as BuildContextRequest['levels']) : undefined,
    limit: query.limit != null ? Number(query.limit) : undefined,
    context:
      query.maxChars != null || query.summaryOnly != null || query.format != null
        ? {
            maxChars: query.maxChars != null ? Number(query.maxChars) : undefined,
            includeSummaryOnly: query.summaryOnly === 'true' || query.summaryOnly === true,
            format:
              query.format === 'markdown' || query.format === 'xml' ? query.format : undefined,
          }
        : undefined,
  };
}
