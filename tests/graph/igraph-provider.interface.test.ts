import { describe, it, expect } from 'vitest';
import type {
  GraphCapabilities,
  GraphNeighbor,
  IGraphProvider,
} from '../../src/graph/igraph-provider.interface.js';
import {
  DEFAULT_GRAPH_MAX_DEPTH,
  DEFAULT_GRAPH_MAX_NEIGHBORS,
} from '../../src/graph/graph.config.js';

class MockGraphProvider implements IGraphProvider {
  async traverseNeighbors(
    seedMemoryId: string,
    ownerId: string,
    options: { remainingBudget: number },
  ): Promise<GraphNeighbor[]> {
    if (options.remainingBudget <= 0) {
      return [];
    }

    return [
      {
        memoryId: 'neighbor-1',
        depth: 1,
        relationType: 'related',
        direction: 'outgoing',
      },
    ];
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

describe('IGraphProvider port', () => {
  it('should allow a mock adapter to implement the contract', async () => {
    const provider = new MockGraphProvider();

    const neighbors = await provider.traverseNeighbors('seed-1', 'owner-1', {
      maxDepth: DEFAULT_GRAPH_MAX_DEPTH,
      remainingBudget: 10,
    });

    expect(neighbors).toHaveLength(1);
    expect(neighbors[0]?.memoryId).toBe('neighbor-1');
    expect(neighbors[0]?.direction).toBe('outgoing');
  });

  it('should expose bidirectional capabilities', () => {
    const caps = new MockGraphProvider().getCapabilities();

    expect(caps.supportsBidirectional).toBe(true);
    expect(caps.maxNeighborsPerRequest).toBe(DEFAULT_GRAPH_MAX_NEIGHBORS);
  });
});
