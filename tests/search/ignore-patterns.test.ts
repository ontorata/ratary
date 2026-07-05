import { describe, it, expect } from 'vitest';
import {
  parseIgnorePatterns,
  sourcePathMatchesIgnore,
  applyIgnorePatternsToSql,
  globToRegExp,
} from '../../src/search/precision/ignore-patterns.js';

describe('parseIgnorePatterns', () => {
  it('splits comma-separated globs', () => {
    expect(parseIgnorePatterns('node_modules/**, .git/**')).toEqual([
      'node_modules/**',
      '.git/**',
    ]);
  });
});

describe('sourcePathMatchesIgnore', () => {
  it('matches nested glob segments', () => {
    expect(sourcePathMatchesIgnore('vault/node_modules/pkg/index.js', ['**/node_modules/**'])).toBe(
      true,
    );
    expect(sourcePathMatchesIgnore('vault/notes/readme.md', ['**/node_modules/**'])).toBe(false);
  });

  it('matches prefix wildcard', () => {
    const pattern = globToRegExp('vault/.git/*');
    expect(pattern.test('vault/.git/config')).toBe(true);
    expect(pattern.test('vault/notes/readme.md')).toBe(false);
  });
});

describe('applyIgnorePatternsToSql', () => {
  it('excludes rows by source_path LIKE clauses', () => {
    const { conditions, params } = applyIgnorePatternsToSql(['node_modules/**', 'vault/.git/*']);

    expect(conditions.length).toBe(2);
    expect(conditions.every((c) => c.includes('source_path IS NULL OR source_path NOT LIKE ?'))).toBe(
      true,
    );
    expect(params).toContain('%node_modules%');
    expect(params).toContain('vault/.git%');
  });
});
