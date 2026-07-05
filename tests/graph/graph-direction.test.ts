import { describe, it, expect } from 'vitest';
import { traverseBidirectional, type RelationEdge } from '../../src/graph/traversal.js';

const edges: RelationEdge[] = [
  { sourceMemoryId: 'a', targetMemoryId: 'b', relation: 'related' },
  { sourceMemoryId: 'b', targetMemoryId: 'c', relation: 'related' },
];

describe('traverseBidirectional direction filter', () => {
  it('returns outgoing neighbors only', () => {
    const neighbors = traverseBidirectional(edges, 'a', {
      maxDepth: 2,
      remainingBudget: 10,
      direction: 'outgoing',
    });
    expect(neighbors.every((neighbor) => neighbor.direction === 'outgoing')).toBe(true);
    expect(neighbors.map((neighbor) => neighbor.memoryId)).toEqual(['b', 'c']);
  });

  it('returns incoming neighbors only', () => {
    const neighbors = traverseBidirectional(edges, 'c', {
      maxDepth: 2,
      remainingBudget: 10,
      direction: 'incoming',
    });
    expect(neighbors.every((neighbor) => neighbor.direction === 'incoming')).toBe(true);
    expect(neighbors.map((neighbor) => neighbor.memoryId)).toEqual(['b', 'a']);
  });
});
