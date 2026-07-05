/**
 * Phase 6.6A — structured search filters (include/exclude, multi-value).
 * Pure types + parser; SQL application in search-filter-sql.ts.
 */

export type TagFilterMode = 'or' | 'and';

export interface SearchFilterGrammar {
  projects?: string[];
  projectExclude?: string[];
  sourcePathPrefix?: string[];
  sourcePathExclude?: string[];
  tags?: string[];
  tagExclude?: string[];
  tagMode?: TagFilterMode;
}

export interface ParsedSearchFilterGrammar extends SearchFilterGrammar {
  tagMode: TagFilterMode;
}

export function parseSearchFilterGrammar(
  input: SearchFilterGrammar | undefined,
): ParsedSearchFilterGrammar | undefined {
  if (!input) return undefined;

  const grammar: ParsedSearchFilterGrammar = {
    tagMode: input.tagMode ?? 'or',
  };

  if (input.projects?.length) grammar.projects = [...input.projects];
  if (input.projectExclude?.length) grammar.projectExclude = [...input.projectExclude];
  if (input.sourcePathPrefix?.length) grammar.sourcePathPrefix = [...input.sourcePathPrefix];
  if (input.sourcePathExclude?.length) grammar.sourcePathExclude = [...input.sourcePathExclude];
  if (input.tags?.length) grammar.tags = [...input.tags];
  if (input.tagExclude?.length) grammar.tagExclude = [...input.tagExclude];

  const hasAny =
    grammar.projects?.length ||
    grammar.projectExclude?.length ||
    grammar.sourcePathPrefix?.length ||
    grammar.sourcePathExclude?.length ||
    grammar.tags?.length ||
    grammar.tagExclude?.length;

  return hasAny ? grammar : undefined;
}

/** Normalize vault-style path for SQL LIKE (forward slashes, no leading ./). */
export function normalizeSourcePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '');
}

export function sourcePathLikePrefix(prefix: string): string {
  const normalized = normalizeSourcePath(prefix).replace(/\/+$/, '');
  return `${normalized}/%`;
}
