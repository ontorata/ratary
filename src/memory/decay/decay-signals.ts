/**
 * Memory decay signals (PI-A / P2-A).
 *
 * Signals are the persisted data contract (owner decision D5): each memory is
 * described by six normalized values in [0, 1]. The combiner
 * ({@link ../decay-score.js}) may evolve independently of this shape.
 */

export const DECAY_SIGNAL_NAMES = [
  'relevance',
  'recency',
  'reactivation',
  'connectivity',
  'importance',
] as const;

export type DecaySignalName = (typeof DECAY_SIGNAL_NAMES)[number];

export interface DecaySignals {
  /** Content-age factor: half-life on `updatedAt`, floored above zero. */
  readonly relevance: number;
  /** Time since last read access (floor when never accessed). */
  readonly recency: number;
  /** Log-scaled access count, weighted by access recency. */
  readonly reactivation: number;
  /** Normalized relation degree — hub memories survive. */
  readonly connectivity: number;
  /** Owner-assigned importance, normalized from 0–100. */
  readonly importance: number;
  /** 1 when the D4 protection lattice matches, else 0. Not part of the weighted product. */
  readonly governanceProtection: 0 | 1;
}

export interface DecaySignalInput {
  readonly updatedAt: string;
  readonly lastAccessed: string | null;
  readonly accessCount: number;
  readonly relationDegree: number;
  /** 0–100 */
  readonly importance: number;
  readonly favorite: boolean;
  readonly tags: readonly string[];
}

export interface DecaySignalConfig {
  readonly halfLifeDays: number;
  /** Minimum value for time-based signals so the product never collapses to 0. */
  readonly signalFloor?: number;
  /** Relation degree at which connectivity saturates to 1. */
  readonly connectivitySaturation?: number;
  /** Access count at which reactivation saturates to 1. */
  readonly reactivationSaturation?: number;
}

export const DEFAULT_SIGNAL_FLOOR = 0.01;
const DEFAULT_CONNECTIVITY_SATURATION = 10;
const DEFAULT_REACTIVATION_SATURATION = 20;
const MS_PER_DAY = 86_400_000;

function halfLifeFactor(ageDays: number, halfLifeDays: number): number {
  return Math.pow(0.5, ageDays / halfLifeDays);
}

function daysBetween(from: string, now: Date): number {
  const fromMs = Date.parse(from);
  if (Number.isNaN(fromMs)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (now.getTime() - fromMs) / MS_PER_DAY);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Pure and deterministic: same input + same `now` ⇒ same signals. */
export function computeDecaySignals(
  input: DecaySignalInput,
  config: DecaySignalConfig,
  now: Date,
  isProtected: boolean,
): DecaySignals {
  const floor = config.signalFloor ?? DEFAULT_SIGNAL_FLOOR;
  const connectivitySaturation =
    config.connectivitySaturation ?? DEFAULT_CONNECTIVITY_SATURATION;
  const reactivationSaturation =
    config.reactivationSaturation ?? DEFAULT_REACTIVATION_SATURATION;

  const relevance = Math.max(
    floor,
    halfLifeFactor(daysBetween(input.updatedAt, now), config.halfLifeDays),
  );

  // Storing counts as the first activity: a never-recalled memory decays from
  // its last content change instead of collapsing straight to the floor.
  const lastActivity = input.lastAccessed ?? input.updatedAt;
  const accessRecency = halfLifeFactor(daysBetween(lastActivity, now), config.halfLifeDays);
  const recency = Math.max(floor, accessRecency);

  const reactivationBase = clamp01(
    Math.log1p(Math.max(0, input.accessCount)) / Math.log1p(reactivationSaturation),
  );
  const reactivation = Math.max(floor, reactivationBase * Math.max(accessRecency, floor));

  const connectivity = Math.max(
    floor,
    clamp01(
      Math.log1p(Math.max(0, input.relationDegree)) / Math.log1p(connectivitySaturation),
    ),
  );

  const importance = Math.max(floor, clamp01(input.importance / 100));

  return {
    relevance,
    recency,
    reactivation,
    connectivity,
    importance,
    governanceProtection: isProtected ? 1 : 0,
  };
}
