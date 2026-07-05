import { describe, it, expect } from 'vitest';
import { computeSemanticHash, normalizeForHash } from '../../src/memory/semantic-hash.js';

describe('semantic-hash', () => {
  it('should normalize text consistently', () => {
    expect(normalizeForHash('  Hello   World  ')).toBe('hello world');
  });

  it('should produce stable semantic hashes', () => {
    const hashA = computeSemanticHash('Title', 'Summary', 'Content body');
    const hashB = computeSemanticHash('Title', 'Summary', 'Content body');
    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64);
  });

  it('should change when content changes', () => {
    const hashA = computeSemanticHash('Title', 'Summary', 'Content A');
    const hashB = computeSemanticHash('Title', 'Summary', 'Content B');
    expect(hashA).not.toBe(hashB);
  });
});
