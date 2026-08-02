import { findAuthorizedCatalogEntry } from './decision-model-catalog.js';
import type { DecisionModelAllowlistRule } from './decision-model-catalog.js';
import { buildRecommendationSandboxFeatures } from './build-recommendation-sandbox-features.js';
import {
  callOntoryDecisionModelSandbox,
  resolveOntorySandboxBridgeConfig,
} from './ontory-decision-model-sandbox-client.js';
import type { RecommendationCard } from './recommendation.mapper.js';
import {
  rerankRecommendationCards,
  type RerankedRecommendationCard,
} from './rerank-recommendation-cards.js';
import type { SandboxOutcome } from './decision-model-catalog.types.js';

export type RecommendationRerankMetadata = Readonly<{
  applied: boolean;
  decisionModelId?: string;
  decisionModelVersion?: string;
  sandboxOutcome?: SandboxOutcome | string;
  pluginDigestPrefix?: string;
  reason?: string;
}>;

function digestPrefix(pluginDigest?: string): string | undefined {
  if (!pluginDigest) return undefined;
  const normalized = pluginDigest.replace(/^sha256:/, '');
  return normalized.slice(0, 12);
}

export async function applyRecommendationRerank(input: {
  cards: readonly RecommendationCard[];
  traceId: string;
  decisionModelId?: string;
  decisionModelVersion?: string;
  allowlist: readonly DecisionModelAllowlistRule[];
}): Promise<{
  cards: RerankedRecommendationCard[];
  rerank?: RecommendationRerankMetadata;
}> {
  if (!input.decisionModelId?.trim()) {
    return { cards: [...input.cards] };
  }

  const modelId = input.decisionModelId.trim();
  const modelVersion = input.decisionModelVersion?.trim() ?? '1.0.0';
  const entry = findAuthorizedCatalogEntry(input.allowlist, modelId, modelVersion);

  if (!entry) {
    return {
      cards: [...input.cards],
      rerank: Object.freeze({
        applied: false,
        decisionModelId: modelId,
        decisionModelVersion: modelVersion,
        reason: 'model_not_authorized',
      }),
    };
  }

  if (!entry.computedPlugin) {
    return {
      cards: [...input.cards],
      rerank: Object.freeze({
        applied: false,
        decisionModelId: modelId,
        decisionModelVersion: modelVersion,
        reason: 'declarative_only',
      }),
    };
  }

  const bridgeConfig = resolveOntorySandboxBridgeConfig();
  if (!bridgeConfig) {
    return {
      cards: [...input.cards],
      rerank: Object.freeze({
        applied: false,
        decisionModelId: modelId,
        decisionModelVersion: modelVersion,
        reason: 'bridge_disabled',
      }),
    };
  }

  const features = buildRecommendationSandboxFeatures({
    traceId: input.traceId,
    cards: input.cards,
  });

  try {
    const sandboxResult = await callOntoryDecisionModelSandbox(bridgeConfig, {
      modelRef: Object.freeze({ id: modelId, version: modelVersion }),
      features,
    });

    const rerankBase = Object.freeze({
      decisionModelId: modelId,
      decisionModelVersion: modelVersion,
      sandboxOutcome: sandboxResult.outcome as SandboxOutcome | string,
      pluginDigestPrefix:
        digestPrefix(sandboxResult.pluginDigest) ?? entry.computedPlugin.artifactDigestPrefix,
    });

    if (sandboxResult.outcome !== 'ok' || !sandboxResult.output?.scores) {
      return {
        cards: [...input.cards],
        rerank: Object.freeze({
          ...rerankBase,
          applied: false,
          reason: sandboxResult.errorMessage ?? 'sandbox_failed',
        }),
      };
    }

    const reranked = rerankRecommendationCards(input.cards, sandboxResult.output.scores);
    return {
      cards: reranked,
      rerank: Object.freeze({
        ...rerankBase,
        applied: true,
      }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      cards: [...input.cards],
      rerank: Object.freeze({
        applied: false,
        decisionModelId: modelId,
        decisionModelVersion: modelVersion,
        reason: message.slice(0, 200),
      }),
    };
  }
}
