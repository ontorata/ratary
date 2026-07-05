export interface CapSearchQueriesResult {
  queries: string[];
  truncated: boolean;
  originalCount: number;
}

/** Trim, drop empties, and cap multi-query fan-out (R66-5). */
export function capSearchQueries(raw: string[], maxQueries: number): CapSearchQueriesResult {
  const filtered = raw.filter((query) => query.trim().length > 0);
  const originalCount = filtered.length;

  if (originalCount === 0) {
    return { queries: [''], truncated: false, originalCount: 0 };
  }

  if (originalCount <= maxQueries) {
    return { queries: filtered, truncated: false, originalCount };
  }

  return {
    queries: filtered.slice(0, maxQueries),
    truncated: true,
    originalCount,
  };
}
