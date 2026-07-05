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
  memoryId?: string;
  depth?: number;
  types?: RelationType[];
  direction?: 'outgoing' | 'incoming' | 'both';
  seed?: {
    memoryId?: string;
    slug?: string;
    sourcePath?: string;
  };
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
    const memoryId = await this.resolveSeedMemoryId(scope, request);
    const memory = await this.memoryReader.findById(memoryId, scope.ownerId, workspaceId);
    if (!memory) {
      throw new NotFoundError('Memory', memoryId);
    }

    const maxDepth = Math.min(request.depth ?? this.config.maxDepth, DEFAULT_GRAPH_MAX_DEPTH_MVP);

    const neighbors = await this.graphProvider.traverseNeighbors(memoryId, scope.ownerId, {
      maxDepth,
      remainingBudget: this.config.maxNeighbors,
      relationTypes: request.types,
      direction: request.direction,
    });

    if (neighbors.length === 0) {
      return {
        seedMemoryId: memoryId,
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
      seedMemoryId: memoryId,
      neighbors: activeNeighbors,
      memoryIds: activeNeighbors.map((neighbor) => neighbor.memoryId),
    };
  }

  private async resolveSeedMemoryId(
    scope: MemoryScope,
    request: TraverseGraphRequest,
  ): Promise<string> {
    const workspaceId = workspaceIdFromScope(scope);
    if (request.memoryId) return request.memoryId;
    if (request.seed?.memoryId) return request.seed.memoryId;

    if (request.seed?.slug) {
      const memory = await this.memoryReader.findBySlug(
        scope.ownerId,
        request.seed.slug,
        workspaceId,
      );
      if (!memory) throw new NotFoundError('Memory', request.seed.slug);
      return memory.id;
    }

    if (request.seed?.sourcePath) {
      const memory = await this.memoryReader.findBySourcePath(
        scope.ownerId,
        request.seed.sourcePath,
        workspaceId,
      );
      if (!memory) throw new NotFoundError('Memory', request.seed.sourcePath);
      return memory.id;
    }

    throw new NotFoundError('Memory', 'seed');
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
