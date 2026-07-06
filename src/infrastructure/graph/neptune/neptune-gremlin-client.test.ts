import { describe, expect, it } from 'vitest';
import { parseNeptuneEdgeResults } from './neptune-gremlin-client.js';
import { traverseBidirectional } from '../../../graph/traversal.js';

describe('parseNeptuneEdgeResults', () => {
  it('parses Gremlin project rows into relation edges', () => {
    const edges = parseNeptuneEdgeResults([
      { source: 'm1', relation: 'related_to', target: 'm2' },
      { source: ['m2'], relation: ['supports'], target: ['m3'] },
    ]);
    expect(edges).toHaveLength(2);
    expect(edges[0]).toEqual({
      sourceMemoryId: 'm1',
      targetMemoryId: 'm2',
      relation: 'related_to',
    });
  });
});

describe('Neptune BFS integration', () => {
  it('traverses parsed Neptune edges', () => {
    const edges = parseNeptuneEdgeResults([
      { source: 'a', relation: 'related_to', target: 'b' },
      { source: 'b', relation: 'related_to', target: 'c' },
    ]);
    const neighbors = traverseBidirectional(edges, 'a', {
      maxDepth: 2,
      remainingBudget: 10,
      direction: 'both',
    });
    expect(neighbors.some((n) => n.memoryId === 'c')).toBe(true);
  });
});
