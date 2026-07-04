import type { RelationType } from '../types/knowledge.js';

/** Hop direction relative to the edge that discovered a neighbor. */
export type GraphTraversalDirection = 'outgoing' | 'incoming';

/**
 * Read-only graph traversal over flat memory_relations.
 * @see .ai/adr/006-igraph-provider.md
 */
export interface IGraphProvider {
  traverseNeighbors(
    seedMemoryId: string,
    ownerId: string,
    options: GraphTraversalOptions,
  ): Promise<GraphNeighbor[]>;

  getCapabilities(): GraphCapabilities;
}

export interface GraphTraversalOptions {
  /** Maximum BFS depth from seed (MVP max: 3). */
  maxDepth: number;
  /**
   * Remaining neighbor budget for this traversal call.
   * Adapter returns at most this many neighbors (may be less if graph exhausted).
   */
  remainingBudget: number;
  /** When set, only traverse these relation types. */
  relationTypes?: RelationType[];
}

export interface GraphNeighbor {
  memoryId: string;
  depth: number;
  relationType: RelationType;
  direction: GraphTraversalDirection;
}

export interface GraphCapabilities {
  supportsTraversal: true;
  supportsBFS: true;
  supportsBidirectional: true;
  maxTraversalDepth: number;
  maxNeighborsPerRequest: number;
}
