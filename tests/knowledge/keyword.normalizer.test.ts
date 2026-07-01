import { describe, it, expect } from 'vitest';
import { normalizeKeywords } from '../../src/knowledge/keyword.normalizer.js';

describe('KeywordNormalizer', () => {
  it('should merge tags and keywords deduped lowercase', () => {
    expect(normalizeKeywords(['Auth', 'JWT'], ['fastify', 'auth'])).toEqual([
      'fastify',
      'auth',
      'jwt',
    ]);
  });
});
