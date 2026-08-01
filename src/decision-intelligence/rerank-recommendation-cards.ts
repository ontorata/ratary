import type { RecommendationCard } from './recommendation.mapper.js';

export type RerankedRecommendationCard = RecommendationCard &
  Readonly<{
    computedScore?: number;
  }>;

export function rerankRecommendationCards(
  cards: readonly RecommendationCard[],
  scores: Readonly<Record<string, number>>,
): RerankedRecommendationCard[] {
  const indexed = cards.map((card, originalIndex) => {
    const computedScore = scores[card.cardId];
    return Object.freeze({ card, originalIndex, computedScore });
  });

  const sorted = [...indexed].sort((left, right) => {
    const leftScore = left.computedScore ?? left.card.confidence ?? 0.5;
    const rightScore = right.computedScore ?? right.card.confidence ?? 0.5;
    if (rightScore !== leftScore) return rightScore - leftScore;
    return left.originalIndex - right.originalIndex;
  });

  return sorted.map(({ card, computedScore }, rankIndex) => {
    const suffix =
      computedScore !== undefined
        ? ` · Re-ranked #${rankIndex + 1} (computed score ${computedScore.toFixed(3)})`
        : '';
    return Object.freeze({
      ...card,
      ...(computedScore !== undefined ? { computedScore } : {}),
      reason: `${card.reason}${suffix}`,
    });
  });
}
