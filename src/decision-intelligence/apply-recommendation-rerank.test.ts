import { describe, expect, it, afterEach, vi } from 'vitest';
import type { RecommendationCard } from './recommendation.mapper.js';
import { applyRecommendationRerank } from './apply-recommendation-rerank.js';

vi.mock('./ontory-decision-model-sandbox-client.js', () => ({
  resolveOntorySandboxBridgeConfig: vi.fn(),
  callOntoryDecisionModelSandbox: vi.fn(),
}));

import {
  callOntoryDecisionModelSandbox,
  resolveOntorySandboxBridgeConfig,
} from './ontory-decision-model-sandbox-client.js';

function card(id: string, confidence?: number): RecommendationCard {
  return {
    cardId: `trace:${id}`,
    title: id,
    advisory: true,
    sourceReference: id,
    confidence,
    evidenceRefs: [id],
    reason: `Recall #${id}`,
  };
}

describe('applyRecommendationRerank PI-P6-D1.1', () => {
  const prevBridge = process.env.ONTORY_SANDBOX_BRIDGE_ENABLED;

  afterEach(() => {
    vi.resetAllMocks();
    if (prevBridge === undefined) delete process.env.ONTORY_SANDBOX_BRIDGE_ENABLED;
    else process.env.ONTORY_SANDBOX_BRIDGE_ENABLED = prevBridge;
  });

  it('returns unchanged cards when no model selected', async () => {
    const cards = [card('a')];
    const result = await applyRecommendationRerank({
      cards,
      traceId: 't1',
      allowlist: ['ontorata-computed-scorer-v1'],
    });
    expect(result.cards).toEqual(cards);
    expect(result.rerank).toBeUndefined();
  });

  it('skips rerank for declarative model', async () => {
    const cards = [card('a')];
    const result = await applyRecommendationRerank({
      cards,
      traceId: 't1',
      decisionModelId: 'ontorata-internal-v1',
      decisionModelVersion: '1.0.0',
      allowlist: ['ontorata-internal-v1'],
    });
    expect(result.rerank?.applied).toBe(false);
    expect(result.rerank?.reason).toBe('declarative_only');
  });

  it('reranks when sandbox returns scores', async () => {
    vi.mocked(resolveOntorySandboxBridgeConfig).mockReturnValue({
      baseUrl: 'http://127.0.0.1:9787',
      token: 'test',
    });
    vi.mocked(callOntoryDecisionModelSandbox).mockResolvedValue({
      modelId: 'ontorata-computed-scorer-v1',
      modelVersion: '1.0.0',
      outcome: 'ok',
      pluginDigest: 'sha256:97212904c798b96d',
      output: Object.freeze({
        advisory: true,
        scores: Object.freeze({ 'trace:a': 0.1, 'trace:b': 0.9 }),
      }),
    });

    const cards = [card('a', 0.9), card('b', 0.1)];
    const result = await applyRecommendationRerank({
      cards,
      traceId: 't1',
      decisionModelId: 'ontorata-computed-scorer-v1',
      decisionModelVersion: '1.0.0',
      allowlist: ['ontorata-computed-scorer-v1'],
    });

    expect(result.rerank?.applied).toBe(true);
    expect(result.cards.map((entry) => entry.title)).toEqual(['b', 'a']);
  });
});
