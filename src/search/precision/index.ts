export {
  parseSearchFilterGrammar,
  normalizeSourcePath,
  sourcePathLikePrefix,
  type SearchFilterGrammar,
  type ParsedSearchFilterGrammar,
  type TagFilterMode,
} from './search-filter-grammar.js';
export { applySearchFilterGrammarToSql, type SqlFragment } from './search-filter-sql.js';
export {
  parseIgnorePatterns,
  sourcePathMatchesIgnore,
  applyIgnorePatternsToSql,
  globToRegExp,
} from './ignore-patterns.js';
export type { IPrecisionSearchService } from './iprecision-search-service.interface.js';
export { PrecisionSearchOrchestrator } from './precision-search-orchestrator.js';
export { MultiQueryRrfFusion, type IMultiQueryFusion } from './multi-query-rrf.js';
export { SearchResultEnricher, type ISearchResultEnricher } from './search-result-enricher.js';
export { rankTitleMode, fuzzyTitleScore, suggestSimilarPaths } from './fuzzy-title-matcher.js';
