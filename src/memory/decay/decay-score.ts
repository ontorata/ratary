/**
 * Decay score combiner (PI-A / P2-A).
 *
 * Weighted geometric mean over the five decayable signals — the multiplicative
 * character means a memory must hold up on every axis to stay strong (a hub
 * that is never recalled still decays; a frequently recalled orphan still
 * fades). Weights are configuration (`DECAY_WEIGHTS`), so the algorithm can
 * evolve without changing the persisted signal contract (owner decision D5).
 *
 * The score is a retention weight, never a deletion countdown: a low score
 * means "resting", and protected memories always score 1.
 */

import {
  DECAY_SIGNAL_NAMES,
  type DecaySignalName,
  type DecaySignals,
  DEFAULT_SIGNAL_FLOOR,
} from './decay-signals.js';

export type DecayWeights = Readonly<Record<DecaySignalName, number>>;

export const DEFAULT_DECAY_WEIGHTS: DecayWeights = Object.freeze({
  relevance: 1,
  recency: 1,
  reactivation: 1,
  connectivity: 1,
  importance: 1,
});

/**
 * Parse `DECAY_WEIGHTS` CSV (`relevance:1,recency:1,...`). Unknown signal
 * names or non-finite/negative weights are configuration errors — fail fast
 * at composition time rather than silently skewing scores.
 */
export function parseDecayWeights(csv: string): DecayWeights {
  const weights: Record<DecaySignalName, number> = { ...DEFAULT_DECAY_WEIGHTS };
  const trimmed = csv.trim();
  if (trimmed === '') return Object.freeze(weights);

  for (const entry of trimmed.split(',')) {
    const [rawName, rawValue] = entry.split(':').map((part) => part?.trim());
    if (!rawName || rawValue === undefined) {
      throw new Error(`DECAY_WEIGHTS: malformed entry "${entry}"`);
    }
    if (!(DECAY_SIGNAL_NAMES as readonly string[]).includes(rawName)) {
      throw new Error(`DECAY_WEIGHTS: unknown signal "${rawName}"`);
    }
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`DECAY_WEIGHTS: invalid weight for "${rawName}": "${rawValue}"`);
    }
    weights[rawName as DecaySignalName] = value;
  }
  return Object.freeze(weights);
}

/** Deterministic; result in [0, 1]. Protected memories always return 1. */
export function combineSignals(signals: DecaySignals, weights: DecayWeights): number {
  if (signals.governanceProtection === 1) return 1;

  let weightSum = 0;
  let logSum = 0;
  for (const name of DECAY_SIGNAL_NAMES) {
    const weight = weights[name];
    if (weight === 0) continue;
    const value = Math.max(DEFAULT_SIGNAL_FLOOR, Math.min(1, signals[name]));
    weightSum += weight;
    logSum += weight * Math.log(value);
  }
  if (weightSum === 0) return 0;
  return Math.exp(logSum / weightSum);
}
