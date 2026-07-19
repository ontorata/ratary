/**
 * Phase 35 / ADR-068 D3 — T3 contract: normalization and rule engine are
 * pure, deterministic, and carry versioned evidence (I2).
 */
import { describe, expect, it } from 'vitest';
import type { CanonicalEntity } from '../../types/entities.js';
import { RESOLVER_VERSION } from '../../types/entities.js';
import { normalizeSymbol } from './normalize.js';
import { applyResolutionRules, type EntityLookup } from './resolution-rules.js';

function entity(overrides: Partial<CanonicalEntity>): CanonicalEntity {
  return {
    id: 'ent-1',
    ownerId: 'owner-1',
    canonicalName: 'Ratary',
    normalizedName: 'ratary',
    kind: 'project',
    confidence: 1,
    sourceType: 'inferred',
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
    ...overrides,
  };
}

function lookupOf(entries: {
  names?: Record<string, CanonicalEntity>;
  aliases?: Record<string, CanonicalEntity>;
}): EntityLookup {
  return {
    byNormalizedName: (n) => entries.names?.[n],
    byNormalizedAlias: (n) => entries.aliases?.[n],
  };
}

describe('normalizeSymbol (ADR-068 D3)', () => {
  it.each([
    ['Ratary', 'ratary'],
    ['  AI  Brain  ', 'ai brain'],
    ['ai-brain', 'ai brain'],
    ['ai_brain', 'ai brain'],
    ['AI-_-Brain', 'ai brain'],
    ['ADR-068', 'adr 068'],
    ['Ｒａｔａｒｙ', 'ratary'], // fullwidth → NFKC
    ['ﬁle-store', 'file store'], // ligature → NFKC
    ['', ''],
    ['---', ''],
  ])('normalizes %j to %j', (input, expected) => {
    expect(normalizeSymbol(input)).toBe(expected);
  });

  it('is idempotent', () => {
    const once = normalizeSymbol('AI--Brain_Platform');
    expect(normalizeSymbol(once)).toBe(once);
  });
});

describe('applyResolutionRules (ADR-068 D3, first match wins)', () => {
  const ratary = entity({});
  const studio = entity({ id: 'ent-2', canonicalName: 'Studio', normalizedName: 'studio' });

  it('canonical_exact wins over alias_exact', () => {
    const lookup = lookupOf({
      names: { ratary },
      aliases: { ratary: studio },
    });
    const match = applyResolutionRules('Ratary', lookup);
    expect(match).toEqual({
      resolved: true,
      entity: ratary,
      evidence: { resolverVersion: RESOLVER_VERSION, rule: 'canonical_exact', matched: 'Ratary' },
    });
  });

  it('falls back to alias_exact with I2 evidence', () => {
    const lookup = lookupOf({ aliases: { 'ai brain': ratary } });
    const match = applyResolutionRules('AI-Brain', lookup);
    expect(match).toEqual({
      resolved: true,
      entity: ratary,
      evidence: { resolverVersion: RESOLVER_VERSION, rule: 'alias_exact', matched: 'AI-Brain' },
    });
  });

  it('returns unresolved with the normalized symbol when nothing matches', () => {
    const match = applyResolutionRules('Unknown-Thing', lookupOf({}));
    expect(match).toEqual({ resolved: false, normalizedSymbol: 'unknown thing' });
  });

  it('treats empty/separator-only symbols as unresolved without lookup calls', () => {
    const lookup: EntityLookup = {
      byNormalizedName: () => {
        throw new Error('must not be called');
      },
      byNormalizedAlias: () => {
        throw new Error('must not be called');
      },
    };
    expect(applyResolutionRules('---', lookup)).toEqual({ resolved: false, normalizedSymbol: '' });
  });

  it('is deterministic: repeated evaluation yields identical results', () => {
    const lookup = lookupOf({ names: { ratary } });
    const first = applyResolutionRules('ratary', lookup);
    const second = applyResolutionRules('ratary', lookup);
    expect(second).toEqual(first);
  });
});
