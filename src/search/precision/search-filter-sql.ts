import {
  normalizeSourcePath,
  sourcePathLikePrefix,
  type ParsedSearchFilterGrammar,
} from './search-filter-grammar.js';

export interface SqlFragment {
  conditions: string[];
  params: unknown[];
}

/** Append AND conditions for SearchFilterGrammar to an existing WHERE builder. */
export function applySearchFilterGrammarToSql(grammar: ParsedSearchFilterGrammar): SqlFragment {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (grammar.projects?.length) {
    conditions.push(`(${grammar.projects.map(() => 'project = ?').join(' OR ')})`);
    params.push(...grammar.projects);
  }

  if (grammar.projectExclude?.length) {
    for (const project of grammar.projectExclude) {
      conditions.push('project != ?');
      params.push(project);
    }
  }

  if (grammar.sourcePathPrefix?.length) {
    const prefixClauses = grammar.sourcePathPrefix.map(() => 'source_path LIKE ?');
    conditions.push(`(${prefixClauses.join(' OR ')})`);
    for (const prefix of grammar.sourcePathPrefix) {
      params.push(sourcePathLikePrefix(prefix));
    }
  }

  if (grammar.sourcePathExclude?.length) {
    for (const exclude of grammar.sourcePathExclude) {
      const normalized = normalizeSourcePath(exclude).replace(/\/+$/, '');
      conditions.push('(source_path IS NULL OR source_path NOT LIKE ?)');
      params.push(`${normalized}/%`);
      conditions.push('(source_path IS NULL OR source_path != ?)');
      params.push(normalized);
    }
  }

  if (grammar.tags?.length) {
    if (grammar.tagMode === 'and') {
      for (const tag of grammar.tags) {
        conditions.push('(tags LIKE ? OR keywords LIKE ?)');
        params.push(`%"${tag}"%`, `%"${tag}"%`);
      }
    } else {
      const tagClauses = grammar.tags.map(() => '(tags LIKE ? OR keywords LIKE ?)');
      conditions.push(`(${tagClauses.join(' OR ')})`);
      for (const tag of grammar.tags) {
        params.push(`%"${tag}"%`, `%"${tag}"%`);
      }
    }
  }

  if (grammar.tagExclude?.length) {
    for (const tag of grammar.tagExclude) {
      conditions.push('(tags NOT LIKE ? AND keywords NOT LIKE ?)');
      params.push(`%"${tag}"%`, `%"${tag}"%`);
    }
  }

  return { conditions, params };
}
