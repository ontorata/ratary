import { describe, it, expect } from 'vitest';
import {
  formatCodename,
  resolveCodenamePrefix,
  parseCodenameSequence,
} from '../../src/knowledge/codename.generator.js';

describe('CodenameGenerator', () => {
  it('should format codename with padded sequence', () => {
    expect(formatCodename('AUTH', 1)).toBe('AUTH-0001');
    expect(formatCodename('FASTIFY', 42)).toBe('FASTIFY-0042');
  });

  it('should resolve prefix from memory type', () => {
    expect(resolveCodenamePrefix({ memoryType: 'architecture' })).toBe('ARCH');
    expect(resolveCodenamePrefix({ memoryType: 'prompt' })).toBe('PROMPT');
  });

  it('should resolve prefix from category then project', () => {
    expect(resolveCodenamePrefix({ category: 'Development' })).toBe('DEVELOPMENT');
    expect(resolveCodenamePrefix({ project: 'ai-brain' })).toBe('AIBRAIN');
    expect(resolveCodenamePrefix({})).toBe('MEM');
  });

  it('should parse sequence from codename', () => {
    expect(parseCodenameSequence('AUTH-0007', 'AUTH')).toBe(7);
    expect(parseCodenameSequence('WRONG-0001', 'AUTH')).toBe(0);
  });
});
