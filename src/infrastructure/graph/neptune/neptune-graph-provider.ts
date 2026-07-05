import type { Env } from '../../../config/env.js';
import {
  DEFAULT_GRAPH_MAX_DEPTH,
  DEFAULT_GRAPH_MAX_NEIGHBORS,
} from '../../../graph/graph.config.js';
import type {
  GraphCapabilities,
  GraphNeighbor,
  GraphTraversalOptions,
  IGraphProvider,
} from '../../../graph/igraph-provider.interface.js';

/**
 * AWS Neptune graph provider stub (D8-03).
 * Enable with GRAPH_PROVIDER=neptune when NEPTUNE_ENDPOINT is configured.
 * Full Gremlin/HTTP implementation is a future phase — port boundary is ready.
 */
export class NeptuneGraphProvider implements IGraphProvider {
  constructor(private readonly env: Env) {}

  async traverseNeighbors(
    _seedMemoryId: string,
    _ownerId: string,
    _options: GraphTraversalOptions,
  ): Promise<GraphNeighbor[]> {
    if (!this.env.NEPTUNE_ENDPOINT?.trim()) {
      throw new Error('NEPTUNE_ENDPOINT is required when GRAPH_PROVIDER=neptune');
    }
    throw new Error(
      'Neptune graph traversal is not implemented yet — use GRAPH_PROVIDER=neo4j or d1',
    );
  }

  getCapabilities(): GraphCapabilities {
    return {
      supportsTraversal: true,
      supportsBFS: true,
      supportsBidirectional: true,
      maxTraversalDepth: DEFAULT_GRAPH_MAX_DEPTH,
      maxNeighborsPerRequest: DEFAULT_GRAPH_MAX_NEIGHBORS,
    };
  }
}
