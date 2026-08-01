import type { RecommendationCard } from './recommendation.mapper.js';

export type RecommendationSandboxFeatureCard = Readonly<{
  id: string;
  score: number;
  weight: number;
}>;

export function buildRecommendationSandboxFeatures(input: {
  traceId: string;
  cards: readonly RecommendationCard[];
}): Readonly<{ traceId: string; evidenceCards: readonly RecommendationSandboxFeatureCard[] }> {
  return Object.freeze({
    traceId: input.traceId,
    evidenceCards: Object.freeze(
      input.cards.map((card) =>
        Object.freeze({
          id: card.cardId,
          score: card.confidence ?? 0.5,
          weight: 1,
        }),
      ),
    ),
  });
}
