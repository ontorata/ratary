import { randomUUID } from 'node:crypto';
import type { ScoredMemory } from './ranker.js';
import type { MemoryScope } from '../types/memory-scope.js';

export type ContextPackageConfidence = 'high' | 'medium' | 'low';

export const CONTEXT_PACKAGE_UPDATE_MECHANISM = 'ratary-buildContext-v1' as const;

/** ADR-1010 / ADR-1011 additive envelope on buildContext results. */
export type ContextPackageEnvelope = Readonly<{
  packageId: string;
  ownerId: string;
  createdAt: string;
  confidence: ContextPackageConfidence;
  updateMechanism: typeof CONTEXT_PACKAGE_UPDATE_MECHANISM;
  sourceLabels: readonly string[];
  query: string;
}>;

export function deriveContextConfidence(memories: readonly ScoredMemory[]): ContextPackageConfidence {
  if (memories.length === 0) return 'low';
  const top = memories[0]?.relevanceScore ?? 0;
  if (top >= 0.7) return 'high';
  if (top >= 0.3) return 'medium';
  return 'low';
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
}): ContextPackageEnvelope {
  const now = input.now ?? (() => new Date());
  return Object.freeze({
    packageId: input.packageId ?? randomUUID(),
    ownerId: input.scope.ownerId,
    createdAt: now().toISOString(),
    confidence: deriveContextConfidence(input.memories),
    updateMechanism: CONTEXT_PACKAGE_UPDATE_MECHANISM,
    sourceLabels: buildSourceLabels(input.memories),
    query: input.query,
  });
}
