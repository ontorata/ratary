import { describe, it, expect } from 'vitest';
import { computeSemanticHash } from '../../src/memory/semantic-hash.js';
import {
  buildEmbedText,
  computeEmbedContentHash,
  excerptContent,
} from '../../src/embedding/embed-text.js';

describe('embed-text', () => {
  it('should build embed text with normalized title and summary and content excerpt', () => {
    const text = buildEmbedText('  Hello World  ', '  Summary Line  ', 'body content');

    expect(text).toBe('hello world\nsummary line\nbody content');
  });

  it('should excerpt content at 500 characters', () => {
    const longContent = 'x'.repeat(600);
    expect(excerptContent(longContent)).toHaveLength(500);
    expect(buildEmbedText('t', 's', longContent).endsWith('x'.repeat(500))).toBe(true);
  });

  it('should produce stable content hash', () => {
    const hashA = computeEmbedContentHash('Title', 'Summary', 'Content');
    const hashB = computeEmbedContentHash('Title', 'Summary', 'Content');

    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64);
  });

  it('should change hash when embed input changes', () => {
    const base = computeEmbedContentHash('Title', 'Summary', 'Content A');
    const changedTitle = computeEmbedContentHash('Title!', 'Summary', 'Content A');
    const changedContent = computeEmbedContentHash('Title', 'Summary', 'Content B');

    expect(changedTitle).not.toBe(base);
    expect(changedContent).not.toBe(base);
  });

  it('should differ from semantic_hash for the same memory fields', () => {
    const embedHash = computeEmbedContentHash('Title', 'Summary', 'Content body');
    const semanticHash = computeSemanticHash('Title', 'Summary', 'Content body');

    expect(embedHash).not.toBe(semanticHash);
  });
});
