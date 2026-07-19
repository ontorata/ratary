/**
 * Decay lifecycle policy (PI-A / P2-A, owner decision D2).
 *
 * ACTIVE → DORMANT → FADING → ARCHIVED, with reactivation promoting back
 * toward ACTIVE on recomputation. Archival is the only prune and is gated:
 * ALL of (score below floor, relation-orphan, unprotected, outside retention
 * window) must hold at once. PURGED does not exist here — hard deletion is a
 * separate maintenance policy outside the decay stage.
 */

import type { DecayLifecycleState } from '../../types/memory.js';

export interface LifecyclePolicyConfig {
  /** Score below which a memory becomes an archive candidate. */
  readonly archiveFloor: number;
  /** Days during which a memory is never archived, regardless of score. */
  readonly retentionDays: number;
  /** Score at or above which a memory is ACTIVE. */
  readonly dormantBelow?: number;
  /** Score below which a memory is FADING (but above the archive floor). */
  readonly fadingBelow?: number;
}

export interface LifecycleContext {
  readonly isProtected: boolean;
  readonly relationDegree: number;
  readonly createdAt: string;
  readonly lastAccessed: string | null;
  readonly now: Date;
}

const DEFAULT_DORMANT_BELOW = 0.35;
const DEFAULT_FADING_BELOW = 0.15;
const MS_PER_DAY = 86_400_000;

export function isWithinRetentionWindow(
  createdAt: string,
  lastAccessed: string | null,
  retentionDays: number,
  now: Date,
): boolean {
  const cutoff = now.getTime() - retentionDays * MS_PER_DAY;
  const createdMs = Date.parse(createdAt);
  if (!Number.isNaN(createdMs) && createdMs >= cutoff) return true;
  if (lastAccessed != null) {
    const accessedMs = Date.parse(lastAccessed);
    if (!Number.isNaN(accessedMs) && accessedMs >= cutoff) return true;
  }
  return false;
}

/**
 * Pure state transition: derives the next lifecycle state from the current
 * decay score. Recomputation is bidirectional — a reactivated memory (higher
 * score) promotes back toward ACTIVE without a special code path.
 */
export function nextLifecycleState(
  score: number,
  config: LifecyclePolicyConfig,
  ctx: LifecycleContext,
): DecayLifecycleState {
  if (ctx.isProtected) return 'active';

  const dormantBelow = config.dormantBelow ?? DEFAULT_DORMANT_BELOW;
  const fadingBelow = config.fadingBelow ?? DEFAULT_FADING_BELOW;

  if (score >= dormantBelow) return 'active';
  if (score >= fadingBelow) return 'dormant';
  if (score >= config.archiveFloor) return 'fading';

  // Below the archive floor: archive only when every gate condition holds.
  const archivable =
    ctx.relationDegree === 0 &&
    !isWithinRetentionWindow(ctx.createdAt, ctx.lastAccessed, config.retentionDays, ctx.now);
  return archivable ? 'archived' : 'fading';
}
