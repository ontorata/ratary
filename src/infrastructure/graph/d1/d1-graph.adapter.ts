import type { ISqlDatabase } from '../../../ports/sql/isql-database.port.js';
import type { RelationType } from '../../../types/knowledge.js';
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

interface RelationEdgeRow {
  source_memory_id: string;
  target_memory_id: string;
  relation: string;
}

/**
 * D1-backed graph provider — loads owner-scoped edges, BFS in-process (ADR-006 MVP).
 * Semantically equivalent to recursive CTE; swap to SQL CTE when relation count exceeds MVP ceiling.
 */
export class D1GraphAdapter implements IGraphProvider {
  constructor(private readonly db: ISqlDatabase) {}

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
    const rows = await this.db.query<RelationEdgeRow>(
      'SELECT source_memory_id, target_memory_id, relation FROM memory_relations WHERE owner_id = ?',
      [ownerId],
    );

    return rows.map((row) => ({
      sourceMemoryId: row.source_memory_id,
      targetMemoryId: row.target_memory_id,
      relation: row.relation as RelationType,
    }));
  }
}
