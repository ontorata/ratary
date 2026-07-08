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
import { traverseBidirectional, type RelationEdge } from '../../../graph/traversal.js';
import {
  HttpNeptuneGremlinClient,
  NEPTUNE_OWNER_EDGES_GREMLIN,
  parseNeptuneEdgeResults,
  type NeptuneGremlinClient,
} from './neptune-gremlin-client.js';

/**
 * AWS Neptune graph provider (Phase 33) — Gremlin edge load + in-process BFS.
 */
export class NeptuneGraphProvider implements IGraphProvider {
  private readonly edgeCache = new Map<string, RelationEdge[]>();
  private readonly client: NeptuneGremlinClient;

  constructor(env: Env, client?: NeptuneGremlinClient) {
    const endpoint = env.NEPTUNE_ENDPOINT?.trim();
    if (!endpoint) {
      throw new Error('NEPTUNE_ENDPOINT is required when GRAPH_PROVIDER=neptune');
    }
    this.client = client ?? new HttpNeptuneGremlinClient(endpoint);
  }

  async traverseNeighbors(
    seedMemoryId: string,
    ownerId: string,
    options: GraphTraversalOptions,
  ): Promise<GraphNeighbor[]> {
    const edges = await this.loadOwnerEdges(ownerId);
    return traverseBidirectional(edges, seedMemoryId, options);
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

  private async loadOwnerEdges(ownerId: string): Promise<RelationEdge[]> {
    const cached = this.edgeCache.get(ownerId);
    if (cached) return cached;

    const data = await this.client.submit(NEPTUNE_OWNER_EDGES_GREMLIN, { ownerId });
    const edges = parseNeptuneEdgeResults(data);
    this.edgeCache.set(ownerId, edges);
    return edges;
  }
}
