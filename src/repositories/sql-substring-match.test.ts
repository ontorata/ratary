import { describe, expect, it } from 'vitest';
import {
  D1_MAX_LIKE_PATTERN_BYTES,
  buildColumnsSubstringMatch,
  deriveLikeSafeSearchTerms,
  likePatternFitsD1,
  truncateToUtf8Bytes,
  utf8ByteLength,
} from './sql-substring-match.js';

describe('sql-substring-match', () => {
  it('keeps short queries as a single term', () => {
    expect(deriveLikeSafeSearchTerms('handoff')).toEqual(['handoff']);
  });

  it('tokenizes queries whose %query% pattern would exceed the D1 LIKE limit', () => {
    const query =
      'Ratary MCP ChatGPT get_context retrieval compression stewardship capability negotiation organizational memory Phase 4 dogfood handoff architecture';
    expect(utf8ByteLength(`%${query}%`)).toBeGreaterThan(D1_MAX_LIKE_PATTERN_BYTES);

    const terms = deriveLikeSafeSearchTerms(query);
    expect(terms.length).toBeGreaterThan(1);
    expect(terms).toContain('organizational');
    expect(terms).toContain('get_context');
    expect(terms).toContain('stewardship');
    for (const term of terms) {
      expect(likePatternFitsD1(`%${term}%`)).toBe(true);
    }
  });

  it('truncates a single oversized token to fit %token%', () => {
    const token = 'a'.repeat(80);
    const terms = deriveLikeSafeSearchTerms(token);
    expect(terms).toHaveLength(1);
    expect(likePatternFitsD1(`%${terms[0]}%`)).toBe(true);
    expect(terms[0]!.length).toBeLessThanOrEqual(48);
  });

  it('builds column OR SQL with D1-safe bound patterns', () => {
    const columns = ['title', 'content', 'summary'] as const;
    const query =
      'Ratary MCP ChatGPT get_context retrieval compression stewardship capability negotiation';
    const { sql, params } = buildColumnsSubstringMatch(columns, query);

    expect(sql).toContain('title LIKE ?');
    expect(sql).toContain(' OR ');
    expect(params.length).toBeGreaterThan(columns.length);
    expect(params.length % columns.length).toBe(0);
    for (const pattern of params) {
      expect(typeof pattern).toBe('string');
      expect(likePatternFitsD1(pattern as string)).toBe(true);
    }
  });

  it('preserves short-query SQL shape used by memory reader', () => {
    const { sql, params } = buildColumnsSubstringMatch(
      ['title', 'content', 'summary', 'project', 'codename', 'keywords'],
      'ADR-2000',
    );
    expect(sql).toBe(
      '(title LIKE ? OR content LIKE ? OR summary LIKE ? OR project LIKE ? OR codename LIKE ? OR keywords LIKE ?)',
    );
    expect(params).toEqual(Array(6).fill('%ADR-2000%'));
  });

  it('truncateToUtf8Bytes respects multibyte characters', () => {
    const value = 'あいうえお';
    const truncated = truncateToUtf8Bytes(value, 6);
    expect(utf8ByteLength(truncated)).toBeLessThanOrEqual(6);
    expect(truncated).toBe('あい');
  });
});
