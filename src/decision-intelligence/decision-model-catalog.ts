import type { DecisionModelCatalogEntry } from './decision-model-catalog.types.js';

/**
 * Read-only mirror of ontory-runtime DECISION_MODEL_MANIFEST (PI-P6-D0 / D1).
 * Update when ontory seed changes — see docs/DECISION-MODEL-CATALOG-SYNC.md
 */
const SEED_CATALOG_ENTRY: DecisionModelCatalogEntry = {
  id: 'ontorata-internal-v1',
  version: '1.0.0',
  displayName: 'Ontorata Internal Strategic v1',
  description: 'Owner dogfood declarative profile for strategic sessions.',
  stability: 'experimental',
  executionProfileName: 'analysis',
  capabilities: ['strategic-reasoning', 'decision-support'],
};

const COMPUTED_CATALOG_ENTRY: DecisionModelCatalogEntry = {
  id: 'ontorata-computed-scorer-v1',
  version: '1.0.0',
  displayName: 'Ontorata Computed Scorer v1',
  description: 'Dogfood computed model with deterministic evidence-card scoring.',
  stability: 'experimental',
  executionProfileName: 'analysis',
  capabilities: ['strategic-reasoning', 'decision-support', 'computed-scoring'],
  computedPlugin: {
    kind: 'worker',
    artifactDigestPrefix: '995fec358de55',
  },
};

export const DECISION_MODEL_CATALOG_MIRROR: readonly DecisionModelCatalogEntry[] = Object.freeze([
  SEED_CATALOG_ENTRY,
  COMPUTED_CATALOG_ENTRY,
]);

export function parseDecisionModelAllowlist(raw: string | undefined): readonly string[] {
  if (!raw?.trim()) return [];
  return Object.freeze(
    raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
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
