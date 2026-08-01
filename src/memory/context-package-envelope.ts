import { randomUUID } from 'node:crypto';
import type { ScoredMemory } from './ranker.js';
import type { MemoryScope } from '../types/memory-scope.js';

export type ContextPackageConfidence = 'high' | 'medium' | 'low';

/** ADR-1013 — package usage eligibility (not memory decay ADR-066). `draft` rejected. */
export type ContextPackageLifecycleState = 'active' | 'retired' | 'archived';

export const CONTEXT_PACKAGE_LIFECYCLE_STATES = [
  'active',
  'retired',
  'archived',
] as const satisfies readonly ContextPackageLifecycleState[];

export const CONTEXT_PACKAGE_UPDATE_MECHANISM = 'ratary-buildContext-v1' as const;

export const CONTEXT_PACKAGE_CONFIDENCE_MODEL_HEURISTIC = 'heuristic-top-relevance-v1' as const;
export const CONTEXT_PACKAGE_CONFIDENCE_MODEL_PRODUCT = 'confidence-product-v1' as const;

export type ContextPackageConfidenceModel =
  | typeof CONTEXT_PACKAGE_CONFIDENCE_MODEL_HEURISTIC
  | typeof CONTEXT_PACKAGE_CONFIDENCE_MODEL_PRODUCT;

/** ADR-1010 / ADR-1011 additive envelope on buildContext results.
 * ADR-1012: `packageId` is the sole version identity; envelope is immutable once minted.
 * ADR-1013: mint sets `lifecycleState: active` and registers SoR; retire/archive via `/context/packages/:id/*`.
 * ADR-1014: do not reuse this envelope across responses; remint every success.
 * ADR-1016: `confidence` via `confidence-product-v1` (advisory); heuristic retained as fallback model id.
 * ADR-1017: freshness = remint (`updateMechanism`); do not patch this envelope.
 * ADR-1018/1019: retrieval opts + update prop stay Ratary pull/remint (see docs-ai). */
export type ContextPackageEnvelope = Readonly<{
  packageId: string;
  ownerId: string;
  createdAt: string;
  confidence: ContextPackageConfidence;
  confidenceModel: ContextPackageConfidenceModel;
  updateMechanism: typeof CONTEXT_PACKAGE_UPDATE_MECHANISM;
  lifecycleState: ContextPackageLifecycleState;
  sourceLabels: readonly string[];
  query: string;
}>;

/** ADR-1013 D2 transitions — payload fields stay immutable; only eligibility label moves. */
export function canTransitionContextPackageLifecycle(
  from: ContextPackageLifecycleState,
  to: ContextPackageLifecycleState,
): boolean {
  if (from === to) return false;
  if (from === 'active' && (to === 'retired' || to === 'archived')) return true;
  if (from === 'retired' && to === 'archived') return true;
  return false;
}

function bandFromUnitScore(score: number): ContextPackageConfidence {
  if (score >= 0.65) return 'high';
  if (score >= 0.35) return 'medium';
  return 'low';
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

/** Normalize boosted relevance toward 0..1 (search scores may exceed 1 after boosts). */
function normalizeRelevance(score: number): number {
  return clamp01(score / 1.5);
}

function daysSince(iso: string, nowMs: number): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return (nowMs - then) / (1000 * 60 * 60 * 24);
}

/** ADR-1016 interim model `heuristic-top-relevance-v1` (retained for rollback / comparison). */
export function deriveContextConfidenceHeuristic(
  memories: readonly ScoredMemory[],
): ContextPackageConfidence {
  if (memories.length === 0) return 'low';
  const top = memories[0]?.relevanceScore ?? 0;
  if (top >= 0.7) return 'high';
  if (top >= 0.3) return 'medium';
  return 'low';
}

/**
 * ADR-1016 product model `confidence-product-v1`.
 * Multi-signal advisory score → high|medium|low (not calibrated ML).
 */
export function deriveContextConfidenceProduct(
  memories: readonly ScoredMemory[],
  nowMs = Date.now(),
): ContextPackageConfidence {
  if (memories.length === 0) return 'low';

  const top = normalizeRelevance(memories[0]?.relevanceScore ?? 0);
  const mean =
    memories.reduce((sum, memory) => sum + normalizeRelevance(memory.relevanceScore), 0) /
    memories.length;
  const coverage = clamp01(memories.length / 3);
  const importance =
    memories.reduce((sum, memory) => sum + clamp01((memory.importance ?? 0) / 100), 0) /
    memories.length;

  const labels = new Set(
    memories.map((memory) => memory.codename?.trim() || memory.title?.trim() || memory.id),
  );
  const diversity = clamp01(labels.size / memories.length);

  const topUpdated = memories[0]?.updatedAt ?? '';
  const ageDays = daysSince(topUpdated, nowMs);
  const freshness = ageDays <= 30 ? 1 : ageDays <= 90 ? 0.5 : 0.2;

  const score =
    top * 0.35 +
    mean * 0.2 +
    coverage * 0.15 +
    importance * 0.15 +
    diversity * 0.05 +
    freshness * 0.1;

  return bandFromUnitScore(score);
}

/** Default mint deriver — product model (ADR-1016 land). */
export function deriveContextConfidence(
  memories: readonly ScoredMemory[],
): ContextPackageConfidence {
  return deriveContextConfidenceProduct(memories);
}

export function buildSourceLabels(memories: readonly ScoredMemory[]): readonly string[] {
  return Object.freeze(
    memories.map((memory, index) => {
      const label = memory.codename?.trim() || memory.title?.trim() || memory.id;
      return label.length > 0 ? label : `memory-${index + 1}`;
    }),
  );
}

export function createContextPackageEnvelope(input: {
  scope: MemoryScope;
  query: string;
  memories: readonly ScoredMemory[];
  now?: () => Date;
  packageId?: string;
  confidenceModel?: ContextPackageConfidenceModel;
}): ContextPackageEnvelope {
  const now = input.now ?? (() => new Date());
  const confidenceModel = input.confidenceModel ?? CONTEXT_PACKAGE_CONFIDENCE_MODEL_PRODUCT;
  const confidence =
    confidenceModel === CONTEXT_PACKAGE_CONFIDENCE_MODEL_HEURISTIC
      ? deriveContextConfidenceHeuristic(input.memories)
      : deriveContextConfidenceProduct(input.memories, now().getTime());

  return Object.freeze({
    packageId: input.packageId ?? randomUUID(),
    ownerId: input.scope.ownerId,
    createdAt: now().toISOString(),
    confidence,
    confidenceModel,
    updateMechanism: CONTEXT_PACKAGE_UPDATE_MECHANISM,
    lifecycleState: 'active',
    sourceLabels: buildSourceLabels(input.memories),
    query: input.query,
  });
}
