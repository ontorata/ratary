import { describe, expect, it } from 'vitest';
import { isProtectedMemory } from '../../src/memory/decay/index.js';

describe('isProtectedMemory (D4 lattice)', () => {
  it('favorite is always protected', () => {
    expect(isProtectedMemory({ favorite: true, importance: 10, tags: [] })).toBe(true);
  });

  it('importance >= 90 is protected', () => {
    expect(isProtectedMemory({ favorite: false, importance: 90, tags: [] })).toBe(true);
    expect(isProtectedMemory({ favorite: false, importance: 89, tags: [] })).toBe(false);
  });

  it('governance tags protect (case-insensitive)', () => {
    for (const tag of ['governance', 'adr', 'architecture', 'baseline', 'ADR']) {
      expect(isProtectedMemory({ favorite: false, importance: 10, tags: [tag] })).toBe(true);
    }
  });

  it('handoff tag alone is NOT protected (owner decision D4)', () => {
    expect(isProtectedMemory({ favorite: false, importance: 50, tags: ['handoff'] })).toBe(false);
  });

  it('handoff combined with a governance tag is protected', () => {
    expect(
      isProtectedMemory({ favorite: false, importance: 50, tags: ['handoff', 'architecture'] }),
    ).toBe(true);
  });

  it('plain memory is unprotected', () => {
    expect(isProtectedMemory({ favorite: false, importance: 50, tags: ['ratary'] })).toBe(false);
  });
});
