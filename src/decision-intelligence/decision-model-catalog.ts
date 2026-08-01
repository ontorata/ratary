import type { DecisionModelCatalogEntry } from './decision-model-catalog.types.js';

/**
 * Read-only mirror of ontory-runtime DECISION_MODEL_MANIFEST (PI-P6-D0).
 * Update when ontory seed changes — see docs/DECISION-MODEL-CATALOG-SYNC.md
 */
export const DECISION_MODEL_CATALOG_MIRROR: readonly DecisionModelCatalogEntry[] = Object.freeze([
  Object.freeze({
    id: 'ontorata-internal-v1',
    version: '1.0.0',
    displayName: 'Ontorata Internal Strategic v1',
    description: 'Owner dogfood declarative profile for strategic sessions.',
    stability: 'experimental' as const,
    executionProfileName: 'analysis',
    capabilities: Object.freeze(['strategic-reasoning', 'decision-support']),
  }),
]);

export function parseDecisionModelAllowlist(raw: string | undefined): readonly string[] {
  if (!raw?.trim()) return [];
  return Object.freeze(raw.split(',').map((item) => item.trim()).filter(Boolean));
}

export function listAuthorizedDecisionModels(
  allowlist: readonly string[],
): readonly DecisionModelCatalogEntry[] {
  if (allowlist.length === 0) return Object.freeze([]);
  return Object.freeze(
    DECISION_MODEL_CATALOG_MIRROR.filter((entry) => allowlist.includes(entry.id)),
  );
}

export function getDecisionModelAllowlistFromEnv(): readonly string[] {
  return parseDecisionModelAllowlist(process.env.DECISION_MODEL_ALLOWLIST);
}
