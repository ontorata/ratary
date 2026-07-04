import { describe, it, expect } from 'vitest';
import { resolveIncludeSummaryOnly } from '../../src/mcp/context-tool-params.js';

describe('resolveIncludeSummaryOnly', () => {
  it('defaults to summary-only when params omitted', () => {
    expect(resolveIncludeSummaryOnly({})).toBe(true);
  });

  it('include_body true opts into full bodies', () => {
    expect(resolveIncludeSummaryOnly({ include_body: true })).toBe(false);
  });

  it('summary_only false opts into full bodies when sent', () => {
    expect(resolveIncludeSummaryOnly({ summary_only: false })).toBe(false);
  });

  it('include_body overrides summary_only', () => {
    expect(resolveIncludeSummaryOnly({ include_body: true, summary_only: true })).toBe(false);
  });

  it('content_mode full opts into full bodies', () => {
    expect(resolveIncludeSummaryOnly({ content_mode: 'full' })).toBe(false);
    expect(resolveIncludeSummaryOnly({ content_mode: 'summary' })).toBe(true);
  });

  it('accepts camelCase includeBody from MCP clients', () => {
    expect(resolveIncludeSummaryOnly({ includeBody: true })).toBe(false);
  });
});
