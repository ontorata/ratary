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

export interface Neo4jQueryRecord {
  get(key: string): unknown;
}

export interface Neo4jQueryClient {
  run(cypher: string, params?: Record<string, unknown>): Promise<{ records: Neo4jQueryRecord[] }>;
}

/**
 * Neo4j graph store adapter — loads owner-scoped edges, BFS in-process (ADR-015).
 * Domain traversal logic stays in graph/traversal.ts.
 */
export class Neo4jGraphStoreAdapter implements IGraphProvider {
  constructor(private readonly client: Neo4jQueryClient) {}

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
    const result = await this.client.run(
      `MATCH (source:Memory {owner_id: $ownerId})-[rel:RELATES_TO]->(target:Memory {owner_id: $ownerId})
       RETURN source.memory_id AS source_memory_id, target.memory_id AS target_memory_id, rel.relation AS relation`,
      { ownerId },
    );

    return result.records.map((record) => ({
      sourceMemoryId: String(record.get('source_memory_id')),
      targetMemoryId: String(record.get('target_memory_id')),
      relation: String(record.get('relation')) as RelationType,
    }));
  }
}

export const NEO4J_GRAPH_DDL = `
CREATE CONSTRAINT memory_id_owner IF NOT EXISTS
FOR (m:Memory) REQUIRE (m.memory_id, m.owner_id) IS UNIQUE;

CREATE INDEX memory_owner IF NOT EXISTS FOR (m:Memory) ON (m.owner_id);
`;
