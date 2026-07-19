/**
 * Phase 35 — deterministic symbol normalization (ADR-068 D3).
 *
 * Pure function, no I/O. Pipeline: Unicode NFKC → lowercase → separators
 * (`-`, `_`) to spaces → collapse whitespace → trim. This is the single
 * normalization used by the registry (normalized_name / normalized_alias)
 * and the resolver, so lookups and storage can never disagree.
 */
export function normalizeSymbol(input: string): string {
  return input.normalize('NFKC').toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}
