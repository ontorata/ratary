/**
 * Phase 35 — deterministic entity resolver (ADR-068 D3, owner decision E2).
 *
 * Read path (`resolve`): resolve-only, never mutates the registry — safe for
 * retrieval. Enrichment path (`resolveWithAutoCreate`): unresolved codename
 * and tag symbols auto-create entities (`source_type='inferred'`); keyword
 * symbols are a resolution signal only and never create (E2).
 *
 * Kind assignment is a fixed constant per field — never learned:
 * codename → project, tag → concept.
 */
import type {
  IEntityResolver,
  SymbolInput,
  SymbolResolution,
} from '../../ports/entities/ientity-resolver.port.js';
import type { IEntityRegistry } from '../../ports/entities/ientity-registry.port.js';
import type { EntityKind, EntityMentionField } from '../../types/entities.js';
import { normalizeSymbol } from './normalize.js';
import { applyResolutionRules } from './resolution-rules.js';

/** Fixed deterministic kind per auto-creating field (E2). */
export const AUTO_CREATE_KIND_BY_FIELD: Partial<Record<EntityMentionField, EntityKind>> = {
  codename: 'project',
  tag: 'concept',
};

export class EntityResolver implements IEntityResolver {
  constructor(private readonly registry: IEntityRegistry) {}

  async resolve(ownerId: string, symbols: readonly SymbolInput[]): Promise<SymbolResolution[]> {
    const results: SymbolResolution[] = [];
    for (const input of symbols) {
      results.push(await this.resolveOne(ownerId, input));
    }
    return results;
  }

  /**
   * Enrichment-only variant (never call from a read path): applies the E2
   * auto-creation policy to unresolved codename/tag symbols, then re-resolves
   * so evidence reflects the actual deterministic rule that matched.
   */
  async resolveWithAutoCreate(
    ownerId: string,
    symbols: readonly SymbolInput[],
  ): Promise<SymbolResolution[]> {
    const results: SymbolResolution[] = [];
    for (const input of symbols) {
      let resolution = await this.resolveOne(ownerId, input);

      const kind = AUTO_CREATE_KIND_BY_FIELD[input.field];
      if (!resolution.resolved && kind && normalizeSymbol(input.symbol).length > 0) {
        await this.registry.create({
          ownerId,
          canonicalName: input.symbol,
          kind,
          sourceType: 'inferred',
        });
        resolution = await this.resolveOne(ownerId, input);
      }

      results.push(resolution);
    }
    return results;
  }

  private async resolveOne(ownerId: string, input: SymbolInput): Promise<SymbolResolution> {
    const normalized = normalizeSymbol(input.symbol);
    if (normalized.length === 0) {
      return { ...input, resolved: false, normalizedSymbol: normalized };
    }

    const byName = await this.registry.findByNormalizedName(ownerId, normalized);
    const byAlias = byName
      ? null
      : await this.registry.findByNormalizedAlias(ownerId, normalized);

    const match = applyResolutionRules(input.symbol, {
      byNormalizedName: (n) => (n === normalized ? (byName ?? undefined) : undefined),
      byNormalizedAlias: (n) => (n === normalized ? (byAlias ?? undefined) : undefined),
    });

    if (!match.resolved) {
      return { ...input, resolved: false, normalizedSymbol: match.normalizedSymbol };
    }

    return {
      ...input,
      resolved: true,
      entity: match.entity,
      confidence: 1,
      evidence: match.evidence,
    };
  }
}
