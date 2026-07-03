import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IMemoryReader } from '../repositories/memory.repository.interface.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type { RelationType } from '../types/knowledge.js';
import type {
  GraphCapabilities,
  GraphNeighbor,
  IGraphProvider,
} from '../graph/igraph-provider.interface.js';
import { D1GraphAdapter } from '../graph/d1-graph.adapter.js';
import { DEFAULT_GRAPH_MAX_DEPTH_MVP } from '../graph/graph.config.js';
import { getEnv } from '../config/index.js';
import { NotFoundError } from '../types/errors.js';
import { workspaceIdFromScope } from '../repositories/repository-scope.js';

export interface GraphServiceConfig {
  maxDepth: number;
  maxNeighbors: number;
  graphRetrievalEnabled: boolean;
}

export interface TraverseGraphRequest {
  memoryId: string;
  depth?: number;
  types?: RelationType[];
}

export interface TraverseGraphResult {
  seedMemoryId: string;
  neighbors: GraphNeighbor[];
  memoryIds: string[];
}

export interface GraphCapabilitiesResponse extends GraphCapabilities {
  graphRetrievalEnabled: boolean;
}

export class GraphService {
  constructor(
    private readonly graphProvider: IGraphProvider,
    private readonly memoryReader: IMemoryReader,
    private readonly config: GraphServiceConfig,
  ) {}

  getCapabilities(): GraphCapabilitiesResponse {
    return {
      ...this.graphProvider.getCapabilities(),
      graphRetrievalEnabled: this.config.graphRetrievalEnabled,
    };
  }

  async traverseRelations(
    scope: MemoryScope,
    request: TraverseGraphRequest,
  ): Promise<TraverseGraphResult> {
    const workspaceId = workspaceIdFromScope(scope);
    const memory = await this.memoryReader.findById(request.memoryId, scope.ownerId, workspaceId);
    if (!memory) {
      throw new NotFoundError('Memory', request.memoryId);
    }

    const maxDepth = Math.min(request.depth ?? this.config.maxDepth, DEFAULT_GRAPH_MAX_DEPTH_MVP);

    const neighbors = await this.graphProvider.traverseNeighbors(request.memoryId, scope.ownerId, {
      maxDepth,
      remainingBudget: this.config.maxNeighbors,
      relationTypes: request.types,
    });

    if (neighbors.length === 0) {
      return {
        seedMemoryId: request.memoryId,
        neighbors: [],
        memoryIds: [],
      };
    }

    const neighborIds = neighbors.map((neighbor) => neighbor.memoryId);
    const memories = await this.memoryReader.findByIds(neighborIds, scope.ownerId, workspaceId);
    const activeIds = new Set(
      memories.filter((memory) => !memory.archived).map((memory) => memory.id),
    );
    const activeNeighbors = neighbors.filter((neighbor) => activeIds.has(neighbor.memoryId));

    return {
      seedMemoryId: request.memoryId,
      neighbors: activeNeighbors,
      memoryIds: activeNeighbors.map((neighbor) => neighbor.memoryId),
    };
  }
}

export function createGraphService(db: ISqlDatabase, memoryReader: IMemoryReader): GraphService {
  const env = getEnv();

  return new GraphService(new D1GraphAdapter(db), memoryReader, {
    maxDepth: env.GRAPH_MAX_DEPTH,
    maxNeighbors: env.GRAPH_MAX_NEIGHBORS,
    graphRetrievalEnabled: env.GRAPH_RETRIEVAL,
  });
}
