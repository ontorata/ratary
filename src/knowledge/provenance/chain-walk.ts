/**
 * Pure why/effect chain walks over provenance-typed edges (ADR-069 D5).
 * Deterministic: depth ASC → edge id ASC → memory id ASC. Cycle-safe.
 */
import type { ProvenanceRelationType } from '../../types/provenance.js';
import { isProvenanceRelationType } from '../../types/provenance.js';

export interface ProvenanceWalkEdge {
  id: string;
  sourceMemoryId: string;
  targetMemoryId: string;
  relation: string;
  metadata?: Record<string, unknown>;
}

export interface ProvenanceChainStep {
  memoryId: string;
  depth: number;
  viaEdgeId: string;
  relation: ProvenanceRelationType;
  direction: 'outgoing';
}

export interface ChainWalkOptions {
  /** Max hop depth from seed (default 8). */
  maxDepth?: number;
  /** Max steps returned (default 64). */
  budget?: number;
}

const WHY_TYPES = new Set<ProvenanceRelationType>(['motivated_by', 'caused_by']);
const EFFECT_TYPES = new Set<ProvenanceRelationType>(['resulted_in', 'supersedes']);

const DEFAULT_MAX_DEPTH = 8;
const DEFAULT_BUDGET = 64;

function compareEdges(a: ProvenanceWalkEdge, b: ProvenanceWalkEdge): number {
  const byId = a.id.localeCompare(b.id);
  if (byId !== 0) return byId;
  return a.targetMemoryId.localeCompare(b.targetMemoryId);
}

function walkOutgoing(
  edges: readonly ProvenanceWalkEdge[],
  seedId: string,
  allowed: ReadonlySet<ProvenanceRelationType>,
  options: ChainWalkOptions = {},
): ProvenanceChainStep[] {
  const maxDepth = Math.min(Math.max(0, options.maxDepth ?? DEFAULT_MAX_DEPTH), 32);
  const budget = Math.max(0, Math.floor(options.budget ?? DEFAULT_BUDGET));

  if (budget === 0 || maxDepth === 0) {
    return [];
  }

  const outgoing = new Map<string, ProvenanceWalkEdge[]>();
  for (const edge of edges) {
    if (!isProvenanceRelationType(edge.relation) || !allowed.has(edge.relation)) {
      continue;
    }
    const list = outgoing.get(edge.sourceMemoryId) ?? [];
    list.push(edge);
    outgoing.set(edge.sourceMemoryId, list);
  }
  for (const list of outgoing.values()) {
    list.sort(compareEdges);
  }

  const visited = new Set<string>([seedId]);
  const queue: Array<{ memoryId: string; depth: number }> = [{ memoryId: seedId, depth: 0 }];
  const results: ProvenanceChainStep[] = [];

  while (queue.length > 0 && results.length < budget) {
    const current = queue.shift();
    if (!current || current.depth >= maxDepth) {
      continue;
    }

    const nextDepth = current.depth + 1;
    const neighbors = outgoing.get(current.memoryId) ?? [];

    for (const edge of neighbors) {
      if (results.length >= budget) break;
      const neighborId = edge.targetMemoryId;
      if (visited.has(neighborId)) continue;

      visited.add(neighborId);
      results.push({
        memoryId: neighborId,
        depth: nextDepth,
        viaEdgeId: edge.id,
        relation: edge.relation,
        direction: 'outgoing',
      });
      queue.push({ memoryId: neighborId, depth: nextDepth });
    }
  }

  return results;
}

/**
 * Why-chain: follow outgoing `motivated_by` / `caused_by` from a decision seed.
 * Source → target means "decision is motivated/caused by target".
 */
export function walkWhyChain(
  edges: readonly ProvenanceWalkEdge[],
  seedId: string,
  options?: ChainWalkOptions,
): ProvenanceChainStep[] {
  return walkOutgoing(edges, seedId, WHY_TYPES, options);
}

/**
 * Effect-chain: follow outgoing `resulted_in` / `supersedes` from a decision seed.
 * Source → target means "decision resulted in / supersedes target".
 */
export function walkEffectChain(
  edges: readonly ProvenanceWalkEdge[],
  seedId: string,
  options?: ChainWalkOptions,
): ProvenanceChainStep[] {
  return walkOutgoing(edges, seedId, EFFECT_TYPES, options);
}
