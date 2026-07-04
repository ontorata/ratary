import type {
  IMemoryReader,
  RetrievalFilters,
} from '../repositories/memory.repository.interface.js';
import type { Memory } from '../types/memory.js';
import type { RelationType } from '../types/knowledge.js';
import type { IRetrievalCandidateSource } from '../memory/retrieval-candidate-source.interface.js';
import type { IGraphProvider } from './igraph-provider.interface.js';

/** Limits for graph-augmented retrieval — wired from env in composition root (ADR-006 step 5). */
export interface GraphRetrievalConfig {
  seedCap: number;
  maxDepth: number;
  maxNeighbors: number;
  relationTypes?: RelationType[];
}

/**
 * Graph retrieval leg: lexical seeds → bidirectional BFS → hydrate neighbors.
 * @see .ai/adr/006-igraph-provider.md Appendix F
 */
export class GraphRetrievalCandidateSource implements IRetrievalCandidateSource {
  constructor(
    private readonly graphProvider: IGraphProvider,
    private readonly memoryReader: IMemoryReader,
    private readonly config: GraphRetrievalConfig,
  ) {}

  async findCandidates(filters: RetrievalFilters): Promise<Memory[]> {
    const { query, ownerId } = filters;

    if (!query) {
      return [];
    }

    const seeds = await this.memoryReader.findRetrievalCandidates({
      ...filters,
      maxCandidates: this.config.seedCap,
    });

    if (seeds.length === 0) {
      return [];
    }

    let budget = this.config.maxNeighbors;
    const seen = new Set<string>(seeds.map((seed) => seed.id));
    const orderedNeighborIds: string[] = [];

    for (const seed of seeds) {
      if (budget <= 0) {
        break;
      }

      const neighbors = await this.graphProvider.traverseNeighbors(seed.id, ownerId, {
        maxDepth: this.config.maxDepth,
        remainingBudget: budget,
        relationTypes: this.config.relationTypes,
      });

      for (const neighbor of neighbors) {
        if (seen.has(neighbor.memoryId)) {
          continue;
        }

        seen.add(neighbor.memoryId);
        orderedNeighborIds.push(neighbor.memoryId);
        budget -= 1;

        if (budget <= 0) {
          break;
        }
      }
    }

    if (orderedNeighborIds.length === 0) {
      return [];
    }

    const memories = await this.memoryReader.findByIds(
      orderedNeighborIds,
      ownerId,
      filters.workspaceId,
    );
    const memoryMap = new Map(memories.map((memory) => [memory.id, memory]));

    const results: Memory[] = [];
    for (const memoryId of orderedNeighborIds) {
      const memory = memoryMap.get(memoryId);
      if (memory && !memory.archived) {
        results.push(memory);
      }
    }

    return results;
  }
}
