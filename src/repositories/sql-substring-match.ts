/**
 * D1-safe substring predicates for memory search.
 *
 * Cloudflare D1 caps LIKE/GLOB patterns at 50 bytes. Wrapping a natural-language
 * `get_context` query as `%${query}%` exceeds that limit and fails with:
 * `LIKE or GLOB pattern too complex: SQLITE_ERROR`.
 *
 * @see https://developers.cloudflare.com/d1/platform/limits/
 */

/** Cloudflare D1 hard limit for LIKE/GLOB pattern length. */
export const D1_MAX_LIKE_PATTERN_BYTES = 50;

/** Bytes available for the literal inside `%…%`. */
export const D1_MAX_LIKE_LITERAL_BYTES = D1_MAX_LIKE_PATTERN_BYTES - 2;

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function likePatternFitsD1(pattern: string): boolean {
  return utf8ByteLength(pattern) <= D1_MAX_LIKE_PATTERN_BYTES;
}

export function truncateToUtf8Bytes(value: string, maxBytes: number): string {
  if (maxBytes <= 0) return '';
  if (utf8ByteLength(value) <= maxBytes) return value;

  let result = '';
  for (const char of value) {
    const next = result + char;
    if (utf8ByteLength(next) > maxBytes) break;
    result = next;
  }
  return result;
}

/**
 * Derive one or more literals so each `%literal%` pattern stays within the D1
 * LIKE byte limit. Short queries stay intact; long queries are tokenized.
 */
export function deriveLikeSafeSearchTerms(query: string, maxTerms = 12): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const whole = `%${trimmed}%`;
  if (likePatternFitsD1(whole)) {
    return [trimmed];
  }

  const tokens = trimmed.split(/[^\p{L}\p{N}_.-]+/u).filter((token) => token.length > 1);

  const candidates: string[] = [];
  for (const token of tokens) {
    const pattern = `%${token}%`;
    if (likePatternFitsD1(pattern)) {
      candidates.push(token);
    } else {
      const truncated = truncateToUtf8Bytes(token, D1_MAX_LIKE_LITERAL_BYTES);
      if (truncated) candidates.push(truncated);
    }
  }

  const unique = [...new Set(candidates)];
  if (unique.length === 0) {
    const fallback = truncateToUtf8Bytes(trimmed, D1_MAX_LIKE_LITERAL_BYTES);
    return fallback ? [fallback] : [];
  }

  // Prefer longer tokens when capping — short stop-like tokens are less selective.
  return unique.sort((a, b) => b.length - a.length || a.localeCompare(b)).slice(0, maxTerms);
}

/**
 * Build `(col LIKE ? OR …)` for short queries, or OR-of-term groups for long
 * ones so every bound LIKE pattern is ≤50 bytes.
 */
export function buildColumnsSubstringMatch(
  columns: readonly string[],
  query: string,
  options?: { maxTerms?: number },
): { sql: string; params: unknown[] } {
  if (columns.length === 0) {
    return { sql: '0', params: [] };
  }

  const terms = deriveLikeSafeSearchTerms(query, options?.maxTerms ?? 12);
  if (terms.length === 0) {
    return { sql: '0', params: [] };
  }

  const groups = terms.map(() => `(${columns.map((column) => `${column} LIKE ?`).join(' OR ')})`);
  const sql = groups.length === 1 ? groups[0]! : `(${groups.join(' OR ')})`;
  const params: unknown[] = [];

  for (const term of terms) {
    const pattern = `%${term}%`;
    const safePattern = likePatternFitsD1(pattern)
      ? pattern
      : `%${truncateToUtf8Bytes(term, D1_MAX_LIKE_LITERAL_BYTES)}%`;
    for (let i = 0; i < columns.length; i++) {
      params.push(safePattern);
    }
  }

  return { sql, params };
}
