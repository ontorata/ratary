/**
 * Phase 35 — deterministic symbol resolution (ADR-068 D3).
 *
 * Resolves surface symbols (codename / tag / keyword values) to canonical
 * entities. v1 is deterministic-only: exact normalized match, then alias
 * match — no fuzzy matching, no embeddings, no LLM.
 *
 * Invariant I2: every resolved result carries versioned evidence
 * (`resolverVersion`, `rule`, `matched`) so replays stay deterministic
 * across future resolver versions.
 */
import type {
  CanonicalEntity,
  EntityMentionField,
  EntityResolutionEvidence,
} from '../../types/entities.js';

export interface SymbolInput {
  /** Raw surface symbol as it appears on the memory, e.g. "ADR-068". */
  symbol: string;
  field: EntityMentionField;
}

export type SymbolResolution =
  | {
      symbol: string;
      field: EntityMentionField;
      resolved: true;
      entity: CanonicalEntity;
      confidence: number;
      evidence: EntityResolutionEvidence;
    }
  | {
      symbol: string;
      field: EntityMentionField;
      resolved: false;
      normalizedSymbol: string;
    };

export interface IEntityResolver {
  /**
   * Deterministic: same registry state + same symbols ⇒ identical results
   * in input order. Auto-creation policy (owner decision E2) is an
   * implementation concern of the enrichment path, never of read paths.
   */
  resolve(ownerId: string, symbols: readonly SymbolInput[]): Promise<SymbolResolution[]>;
}
