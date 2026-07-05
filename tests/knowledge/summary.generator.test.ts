import { describe, it, expect } from 'vitest';
import { generateSummary, SUMMARY_MAX_LENGTH } from '../../src/knowledge/summary.generator.js';

describe('SummaryGenerator', () => {
  it('should strip markdown and truncate', () => {
    const content = '# Title\n\nThis is **bold** content about Fastify auth middleware.';
    const summary = generateSummary(content);
    expect(summary).not.toContain('#');
    expect(summary).not.toContain('**');
    expect(summary.length).toBeLessThanOrEqual(SUMMARY_MAX_LENGTH);
  });

  it('should return short content as-is', () => {
    expect(generateSummary('Short note')).toBe('Short note');
  });
});
