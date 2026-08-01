import { describe, expect, it } from 'vitest';
import type { RecommendationCard } from '../../src/decision-intelligence/recommendation.mapper.js';
import { rerankRecommendationCards } from '../../src/decision-intelligence/rerank-recommendation-cards.js';

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

describe('rerankRecommendationCards PI-P6-D1.1', () => {
  it('sorts by computed score descending with stable tie-break', () => {
    const cards = [card('a', 0.9), card('b', 0.1), card('c', 0.5)];
    const reranked = rerankRecommendationCards(cards, {
      'trace:a': 0.2,
      'trace:b': 0.9,
      'trace:c': 0.5,
    });

    expect(reranked.map((entry) => entry.title)).toEqual(['b', 'c', 'a']);
    expect(reranked[0]?.computedScore).toBe(0.9);
    expect(reranked[0]?.reason).toContain('Re-ranked #1');
  });
});
