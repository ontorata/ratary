import { describe, expect, it } from 'vitest';
import {
  DECISION_MODEL_CATALOG_MIRROR,
  findAuthorizedCatalogEntry,
  isDecisionModelAuthorized,
  listAuthorizedDecisionModels,
  parseDecisionModelAllowlist,
} from '../../src/decision-intelligence/decision-model-catalog.js';

describe('decision-model-catalog mirror', () => {
  it('includes ontorata-internal-v1 seed', () => {
    expect(DECISION_MODEL_CATALOG_MIRROR.some((m) => m.id === 'ontorata-internal-v1')).toBe(true);
  });

  it('includes computed scorer versions with computedPlugin summary', () => {
    const versions = DECISION_MODEL_CATALOG_MIRROR.filter(
      (m) => m.id === 'ontorata-computed-scorer-v1',
    );
    expect(versions).toHaveLength(2);
    expect(versions.every((m) => m.computedPlugin?.kind === 'worker')).toBe(true);
  });

  it('filters by unpinned id allowlist (all versions)', () => {
    const rules = parseDecisionModelAllowlist('ontorata-computed-scorer-v1');
    expect(listAuthorizedDecisionModels(rules)).toHaveLength(2);
  });

  it('filters by pinned id@version allowlist', () => {
    const rules = parseDecisionModelAllowlist('ontorata-computed-scorer-v1@1.1.0');
    const models = listAuthorizedDecisionModels(rules);
    expect(models).toHaveLength(1);
    expect(models[0]?.version).toBe('1.1.0');
  });

  it('findAuthorizedCatalogEntry rejects unpinned version when only pin authorized', () => {
    const rules = parseDecisionModelAllowlist('ontorata-computed-scorer-v1@1.1.0');
    expect(findAuthorizedCatalogEntry(rules, 'ontorata-computed-scorer-v1', '1.0.0')).toBeUndefined();
    expect(findAuthorizedCatalogEntry(rules, 'ontorata-computed-scorer-v1', '1.1.0')?.version).toBe(
      '1.1.0',
    );
  });

  it('default deny when allowlist empty', () => {
    expect(listAuthorizedDecisionModels([])).toEqual([]);
    expect(isDecisionModelAuthorized(DECISION_MODEL_CATALOG_MIRROR[0]!, [])).toBe(false);
  });

  it('parses comma-separated allowlist env with id@version tokens', () => {
    expect(parseDecisionModelAllowlist('a, b@2.0.0 ,c')).toEqual([
      { id: 'a' },
      { id: 'b', version: '2.0.0' },
      { id: 'c' },
    ]);
  });
});
