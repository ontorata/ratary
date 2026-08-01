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

  it('includes computed scorer with computedPlugin summary', () => {
    const computed = DECISION_MODEL_CATALOG_MIRROR.find(
      (m) => m.id === 'ontorata-computed-scorer-v1',
    );
    expect(computed?.computedPlugin?.kind).toBe('worker');
    expect(computed?.computedPlugin?.artifactDigestPrefix).toBe('97212904c798');
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
