import { describe, expect, it } from 'vitest';
import { Neo4jGraphStoreAdapter } from '../../src/infrastructure/graph/neo4j/neo4j-graph-store.adapter.js';
import type { Neo4jQueryClient } from '../../src/infrastructure/graph/neo4j/neo4j-graph-store.adapter.js';

describe('Neo4jGraphStoreAdapter', () => {
  it('should traverse neighbors using loaded edges', async () => {
    const client: Neo4jQueryClient = {
      run: async () => ({
        records: [
          {
            get(key: string) {
              if (key === 'source_memory_id') return 'seed';
              if (key === 'target_memory_id') return 'neighbor';
              if (key === 'relation') return 'depends_on';
              return null;
            },
          },
        ],
      }),
    };

    const adapter = new Neo4jGraphStoreAdapter(client);
    const neighbors = await adapter.traverseNeighbors('seed', 'owner-a', {
      maxDepth: 1,
      remainingBudget: 5,
    });

    expect(neighbors).toEqual([
      {
        memoryId: 'neighbor',
        depth: 1,
        relationType: 'depends_on',
        direction: 'outgoing',
      },
    ]);
  });
});
