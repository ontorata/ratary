import type { RelationType } from '../types/knowledge.js';
import type { GraphNeighbor, GraphTraversalOptions } from './igraph-provider.interface.js';
import { DEFAULT_GRAPH_MAX_DEPTH_MVP } from './graph.config.js';

export interface RelationEdge {
  sourceMemoryId: string;
  targetMemoryId: string;
  relation: RelationType;
}

/**
 * Bidirectional BFS over flat relation edges (ADR-006).
 * Pure function — D1 adapter loads edges then delegates here.
 */
export function traverseBidirectional(
  edges: RelationEdge[],
  seedMemoryId: string,
  options: GraphTraversalOptions,
): GraphNeighbor[] {
  const maxDepth = Math.min(Math.max(0, options.maxDepth), DEFAULT_GRAPH_MAX_DEPTH_MVP);
  const budget = Math.max(0, Math.floor(options.remainingBudget));

  if (budget === 0 || maxDepth === 0) {
    return [];
  }

  const allowedTypes = options.relationTypes ? new Set(options.relationTypes) : null;
  const outgoing = new Map<string, RelationEdge[]>();
  const incoming = new Map<string, RelationEdge[]>();

  for (const edge of edges) {
    if (allowedTypes && !allowedTypes.has(edge.relation)) {
      continue;
    }

    const outList = outgoing.get(edge.sourceMemoryId) ?? [];
    outList.push(edge);
    outgoing.set(edge.sourceMemoryId, outList);

    const inList = incoming.get(edge.targetMemoryId) ?? [];
    inList.push(edge);
    incoming.set(edge.targetMemoryId, inList);
  }

  const visited = new Set<string>([seedMemoryId]);
  const queue: Array<{ memoryId: string; depth: number }> = [{ memoryId: seedMemoryId, depth: 0 }];
  const results: GraphNeighbor[] = [];

  while (queue.length > 0 && results.length < budget) {
    const current = queue.shift();
    if (!current || current.depth >= maxDepth) {
      continue;
    }

    const nextDepth = current.depth + 1;

    for (const edge of outgoing.get(current.memoryId) ?? []) {
      if (results.length >= budget) break;
      const neighborId = edge.targetMemoryId;
      if (visited.has(neighborId)) continue;

      visited.add(neighborId);
      results.push({
        memoryId: neighborId,
        depth: nextDepth,
        relationType: edge.relation,
        direction: 'outgoing',
      });
      queue.push({ memoryId: neighborId, depth: nextDepth });
    }

    for (const edge of incoming.get(current.memoryId) ?? []) {
      if (results.length >= budget) break;
      const neighborId = edge.sourceMemoryId;
      if (visited.has(neighborId)) continue;

      visited.add(neighborId);
      results.push({
        memoryId: neighborId,
        depth: nextDepth,
        relationType: edge.relation,
        direction: 'incoming',
      });
      queue.push({ memoryId: neighborId, depth: nextDepth });
    }
  }

  return results;
}
