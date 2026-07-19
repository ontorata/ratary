/**
 * Phase 35 — deterministic resolution rule engine (ADR-068 D3).
 *
 * Pure domain logic, no I/O: rules are evaluated against a caller-provided
 * lookup snapshot in fixed precedence order, first match wins:
 *
 *   1. `canonical_exact` — normalized symbol equals an entity's normalized name
 *   2. `alias_exact`     — normalized symbol equals a registered alias
 *
 * Invariant I2: every match carries `{ resolverVersion, rule, matched }`
 * evidence so results remain replayable when future rule sets ship.
 */
import type { CanonicalEntity, EntityResolutionEvidence } from '../../types/entities.js';
import { RESOLVER_VERSION } from '../../types/entities.js';
import { normalizeSymbol } from './normalize.js';

/** Read-only registry snapshot the pure rule engine matches against. */
export interface EntityLookup {
  byNormalizedName(normalized: string): CanonicalEntity | undefined;
  byNormalizedAlias(normalized: string): CanonicalEntity | undefined;
}

export type RuleMatch =
  | { resolved: true; entity: CanonicalEntity; evidence: EntityResolutionEvidence }
  | { resolved: false; normalizedSymbol: string };

export function applyResolutionRules(symbol: string, lookup: EntityLookup): RuleMatch {
  const normalized = normalizeSymbol(symbol);
  if (normalized.length === 0) {
    return { resolved: false, normalizedSymbol: normalized };
  }

  const canonical = lookup.byNormalizedName(normalized);
  if (canonical) {
    return {
      resolved: true,
      entity: canonical,
      evidence: { resolverVersion: RESOLVER_VERSION, rule: 'canonical_exact', matched: symbol },
    };
  }

  const aliased = lookup.byNormalizedAlias(normalized);
  if (aliased) {
    return {
      resolved: true,
      entity: aliased,
      evidence: { resolverVersion: RESOLVER_VERSION, rule: 'alias_exact', matched: symbol },
    };
  }

  return { resolved: false, normalizedSymbol: normalized };
}
