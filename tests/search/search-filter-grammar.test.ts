import { describe, it, expect } from 'vitest';
import {
  parseSearchFilterGrammar,
  normalizeSourcePath,
  sourcePathLikePrefix,
} from '../../src/search/precision/search-filter-grammar.js';
import { applySearchFilterGrammarToSql } from '../../src/search/precision/search-filter-sql.js';

describe('parseSearchFilterGrammar', () => {
  it('returns undefined for empty input', () => {
    expect(parseSearchFilterGrammar(undefined)).toBeUndefined();
    expect(parseSearchFilterGrammar({})).toBeUndefined();
  });

  it('parses include/exclude project and tag filters', () => {
    const grammar = parseSearchFilterGrammar({
      projects: ['ai-brain', 'ratary'],
      projectExclude: ['scratch'],
      tags: ['auth', 'jwt'],
      tagExclude: ['draft'],
      tagMode: 'and',
    });

    expect(grammar).toEqual({
      projects: ['ai-brain', 'ratary'],
      projectExclude: ['scratch'],
      tags: ['auth', 'jwt'],
      tagExclude: ['draft'],
      tagMode: 'and',
    });
  });

  it('builds SQL for project, path prefix, and tag exclude', () => {
    const grammar = parseSearchFilterGrammar({
      projects: ['docs'],
      sourcePathPrefix: ['vault/notes'],
      sourcePathExclude: ['vault/archive'],
      tags: ['guide'],
      tagExclude: ['wip'],
    });

    const { conditions, params } = applySearchFilterGrammarToSql(grammar!);

    expect(conditions).toContain('(project = ?)');
    expect(conditions.some((c) => c.includes('source_path LIKE ?'))).toBe(true);
    expect(conditions.some((c) => c.includes('source_path IS NULL OR source_path NOT LIKE ?'))).toBe(
      true,
    );
    expect(conditions.some((c) => c.includes('tags NOT LIKE ? AND keywords NOT LIKE ?'))).toBe(true);
    expect(params).toContain('docs');
    expect(params).toContain('vault/notes/%');
    expect(params).toContain('vault/archive/%');
    expect(params).toContain('vault/archive');
    expect(params).toContain('%"guide"%');
    expect(params).toContain('%"wip"%');
  });
});

describe('source path helpers', () => {
  it('normalizes windows-style paths', () => {
    expect(normalizeSourcePath('.\\vault\\note.md')).toBe('vault/note.md');
  });

  it('builds LIKE prefix for nested paths', () => {
    expect(sourcePathLikePrefix('vault/notes/')).toBe('vault/notes/%');
  });
});
