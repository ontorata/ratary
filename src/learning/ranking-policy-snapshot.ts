import { RETRIEVAL_WEIGHTS } from '../search/ranking.config.js';
import {
  LEARNING_WEIGHT_MULTIPLIER_MAX,
  LEARNING_WEIGHT_MULTIPLIER_MIN,
} from './learning.constants.js';
import type { RankingPolicySnapshot } from './learning.types.js';

export type RetrievalWeightKey = keyof typeof RETRIEVAL_WEIGHTS;

export function clampMultiplier(value: number): number {
  return Math.min(LEARNING_WEIGHT_MULTIPLIER_MAX, Math.max(LEARNING_WEIGHT_MULTIPLIER_MIN, value));
}

export function resolveRetrievalWeight(
  key: RetrievalWeightKey,
  snapshot?: RankingPolicySnapshot,
): number {
  const base = RETRIEVAL_WEIGHTS[key];
  const multiplier = snapshot?.retrievalWeightMultipliers[key] ?? 1;
  return base * clampMultiplier(multiplier);
}
