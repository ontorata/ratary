import { describe, expect, it } from 'vitest';
import {
  DECISION_MODEL_CATALOG_MIRROR,
  listAuthorizedDecisionModels,
  parseDecisionModelAllowlist,
} from '../../src/decision-intelligence/decision-model-catalog.js';

describe('decision-model-catalog mirror', () => {
  it('includes ontorata-internal-v1 seed', () => {
    expect(DECISION_MODEL_CATALOG_MIRROR.some((m) => m.id === 'ontorata-internal-v1')).toBe(true);
  });

  it('filters by allowlist with default deny', () => {
    expect(listAuthorizedDecisionModels([])).toEqual([]);
    expect(listAuthorizedDecisionModels(['ontorata-internal-v1'])).toHaveLength(1);
    expect(listAuthorizedDecisionModels(['unknown'])).toEqual([]);
  });

  it('parses comma-separated allowlist env', () => {
    expect(parseDecisionModelAllowlist('a, b ,c')).toEqual(['a', 'b', 'c']);
  });
});
