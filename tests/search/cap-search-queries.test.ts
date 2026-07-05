import { describe, it, expect } from 'vitest';
import { capSearchQueries } from '../../src/search/precision/cap-search-queries.js';

describe('capSearchQueries', () => {
  it('returns placeholder when all queries empty', () => {
    const result = capSearchQueries(['', '  '], 5);
    expect(result.queries).toEqual(['']);
    expect(result.truncated).toBe(false);
    expect(result.originalCount).toBe(0);
  });

  it('passes through queries within cap', () => {
    const result = capSearchQueries(['auth', ' jwt ', 'token'], 5);
    expect(result.queries).toEqual(['auth', ' jwt ', 'token']);
    expect(result.truncated).toBe(false);
    expect(result.originalCount).toBe(3);
  });

  it('truncates queries beyond max and sets truncated flag', () => {
    const result = capSearchQueries(['a', 'b', 'c', 'd', 'e', 'f'], 5);
    expect(result.queries).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(result.truncated).toBe(true);
    expect(result.originalCount).toBe(6);
  });
});
