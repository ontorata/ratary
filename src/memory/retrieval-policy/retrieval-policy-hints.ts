/** Optional ranked-corpus hints for rule-based adaptive policy (pure inputs — no I/O). */
export interface AdaptiveRetrievalHints {
  avgAccessCount: number;
  avgImportance: number;
  topImportance: number;
}

export function buildAdaptiveRetrievalHints(
  ranked: ReadonlyArray<{ accessCount: number; importance: number }>,
): AdaptiveRetrievalHints | undefined {
  if (ranked.length === 0) {
    return undefined;
  }

  let accessSum = 0;
  let importanceSum = 0;
  let topImportance = 0;

  for (const memory of ranked) {
    accessSum += memory.accessCount ?? 0;
    const importance = memory.importance ?? 50;
    importanceSum += importance;
    if (importance > topImportance) {
      topImportance = importance;
    }
  }

  return {
    avgAccessCount: accessSum / ranked.length,
    avgImportance: importanceSum / ranked.length,
    topImportance,
  };
}
