import { describe, it, expect } from 'vitest';
import { cosineSimilarity } from '../../src/embedding/cosine-similarity.js';

describe('cosineSimilarity', () => {
  it('should return 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBe(1);
  });

  it('should return 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it('should return 0 for zero vectors', () => {
    expect(cosineSimilarity([0, 0], [1, 0])).toBe(0);
  });

  it('should throw on dimension mismatch', () => {
    expect(() => cosineSimilarity([1], [1, 2])).toThrow(/dimension mismatch/i);
  });
});
