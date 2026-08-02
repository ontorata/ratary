import type { DecisionModelCatalogEntry } from './decision-model-catalog.types.js';

/**
 * Read-only mirror of ontory-runtime DECISION_MODEL_MANIFEST (PI-P6-D0 / D1 / D2).
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

const COMPUTED_CATALOG_ENTRY_V100: DecisionModelCatalogEntry = {
  id: 'ontorata-computed-scorer-v1',
  version: '1.0.0',
  displayName: 'Ontorata Computed Scorer v1',
  description: 'Dogfood computed model with deterministic evidence-card scoring (weighted mean).',
  stability: 'deprecated',
  executionProfileName: 'analysis',
  capabilities: ['strategic-reasoning', 'decision-support', 'computed-scoring'],
  computedPlugin: {
    kind: 'worker',
    artifactDigestPrefix: '97212904c798',
  },
};

const COMPUTED_CATALOG_ENTRY_V110: DecisionModelCatalogEntry = {
  id: 'ontorata-computed-scorer-v1',
  version: '1.1.0',
  displayName: 'Ontorata Computed Scorer v1.1',
  description: 'Max-score overall variant for PI-P6-D2 version coexistence dogfood.',
  stability: 'experimental',
  executionProfileName: 'analysis',
  capabilities: ['strategic-reasoning', 'decision-support', 'computed-scoring'],
  computedPlugin: {
    kind: 'worker',
    artifactDigestPrefix: '0ea83038d929',
  },
};

export const DECISION_MODEL_CATALOG_MIRROR: readonly DecisionModelCatalogEntry[] = Object.freeze([
  SEED_CATALOG_ENTRY,
  COMPUTED_CATALOG_ENTRY_V100,
  COMPUTED_CATALOG_ENTRY_V110,
]);

export type DecisionModelAllowlistRule = Readonly<{
  id: string;
  version?: string;
}>;

export function parseDecisionModelAllowlist(
  raw: string | undefined,
): readonly DecisionModelAllowlistRule[] {
  if (!raw?.trim()) return Object.freeze([]);
  const rules = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((token): DecisionModelAllowlistRule => {
      const at = token.lastIndexOf('@');
      if (at > 0) {
        const id = token.slice(0, at).trim();
        const version = token.slice(at + 1).trim();
        if (id && version) {
          return Object.freeze({ id, version });
        }
      }
      return Object.freeze({ id: token });
    });
  return Object.freeze(rules);
}

export function isDecisionModelAuthorized(
  entry: DecisionModelCatalogEntry,
  rules: readonly DecisionModelAllowlistRule[],
): boolean {
  if (rules.length === 0) return false;
  for (const rule of rules) {
    if (rule.id !== entry.id) continue;
    if (rule.version === undefined) return true;
    if (rule.version === entry.version) return true;
  }
  return false;
}

export function listAuthorizedDecisionModels(
  rules: readonly DecisionModelAllowlistRule[],
): readonly DecisionModelCatalogEntry[] {
  if (rules.length === 0) return Object.freeze([]);
  return Object.freeze(
    DECISION_MODEL_CATALOG_MIRROR.filter((entry) => isDecisionModelAuthorized(entry, rules)),
  );
}

export function getDecisionModelAllowlistFromEnv(): readonly DecisionModelAllowlistRule[] {
  return parseDecisionModelAllowlist(process.env.DECISION_MODEL_ALLOWLIST);
}

export function findAuthorizedCatalogEntry(
  rules: readonly DecisionModelAllowlistRule[],
  decisionModelId: string,
  decisionModelVersion: string,
): DecisionModelCatalogEntry | undefined {
  const entry = DECISION_MODEL_CATALOG_MIRROR.find(
    (candidate) => candidate.id === decisionModelId && candidate.version === decisionModelVersion,
  );
  if (!entry) return undefined;
  return isDecisionModelAuthorized(entry, rules) ? entry : undefined;
}
