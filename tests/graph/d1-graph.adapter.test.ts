import { describe, it, expect, beforeEach } from 'vitest';
import { traverseBidirectional } from '../../src/graph/traversal.js';
import type { RelationEdge } from '../../src/graph/traversal.js';
import { D1GraphAdapter } from '../../src/graph/d1-graph.adapter.js';
import { MemoryRelationRepository } from '../../src/repositories/memory-relation.repository.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { DEFAULT_GRAPH_MAX_DEPTH } from '../../src/graph/graph.config.js';

const ID_A = '00000000-0000-0000-0000-000000000001';
const ID_B = '00000000-0000-0000-0000-000000000002';
const ID_C = '00000000-0000-0000-0000-000000000003';
const ID_D = '00000000-0000-0000-0000-000000000004';
const ownerId = 'graph-owner';

function edge(
  source: string,
  target: string,
  relation: RelationEdge['relation'] = 'related',
): RelationEdge {
  return { sourceMemoryId: source, targetMemoryId: target, relation };
}

describe('traverseBidirectional', () => {
  it('should traverse outgoing neighbors', () => {
    const results = traverseBidirectional([edge(ID_A, ID_B, 'depends_on')], ID_A, {
      maxDepth: 2,
      remainingBudget: 10,
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      memoryId: ID_B,
      depth: 1,
      relationType: 'depends_on',
      direction: 'outgoing',
    });
  });

  it('should traverse incoming neighbors (bidirectional)', () => {
    const results = traverseBidirectional([edge(ID_A, ID_B, 'depends_on')], ID_B, {
      maxDepth: 2,
      remainingBudget: 10,
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      memoryId: ID_A,
      depth: 1,
      direction: 'incoming',
    });
  });

  it('should respect maxDepth', () => {
    const edges = [edge(ID_A, ID_B), edge(ID_B, ID_C)];

    const depth1 = traverseBidirectional(edges, ID_A, {
      maxDepth: 1,
      remainingBudget: 10,
    });
    expect(depth1.map((n) => n.memoryId)).toEqual([ID_B]);

    const depth2 = traverseBidirectional(edges, ID_A, {
      maxDepth: 2,
      remainingBudget: 10,
    });
    expect(depth2.map((n) => n.memoryId)).toEqual([ID_B, ID_C]);
  });

  it('should respect remainingBudget across the traversal', () => {
    const edges = [edge(ID_A, ID_B), edge(ID_A, ID_C), edge(ID_B, ID_D)];

    const results = traverseBidirectional(edges, ID_A, {
      maxDepth: 2,
      remainingBudget: 2,
    });

    expect(results).toHaveLength(2);
  });

  it('should filter by relationTypes', () => {
    const edges = [edge(ID_A, ID_B, 'depends_on'), edge(ID_A, ID_C, 'related')];

    const results = traverseBidirectional(edges, ID_A, {
      maxDepth: 2,
      remainingBudget: 10,
      relationTypes: ['depends_on'],
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.memoryId).toBe(ID_B);
  });

  it('should not include the seed memory', () => {
    const results = traverseBidirectional([edge(ID_A, ID_B)], ID_A, {
      maxDepth: 2,
      remainingBudget: 10,
    });

    expect(results.every((n) => n.memoryId !== ID_A)).toBe(true);
  });
});

describe('D1GraphAdapter', () => {
  let mockDb: MockD1Client;
  let relationRepo: MemoryRelationRepository;
  let adapter: D1GraphAdapter;

  beforeEach(() => {
    mockDb = new MockD1Client();
    relationRepo = new MemoryRelationRepository(mockDb);
    adapter = new D1GraphAdapter(mockDb);
  });

  it('should traverse via D1-loaded edges with owner isolation', async () => {
    await relationRepo.insert({
      sourceMemoryId: ID_A,
      targetMemoryId: ID_B,
      relation: 'related',
      ownerId,
    });
    await relationRepo.insert({
      sourceMemoryId: ID_A,
      targetMemoryId: ID_C,
      relation: 'related',
      ownerId: 'other-owner',
    });

    const results = await adapter.traverseNeighbors(ID_A, ownerId, {
      maxDepth: DEFAULT_GRAPH_MAX_DEPTH,
      remainingBudget: 10,
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.memoryId).toBe(ID_B);
  });

  it('should expose bidirectional capabilities', () => {
    const caps = adapter.getCapabilities();
    expect(caps.supportsBidirectional).toBe(true);
    expect(caps.maxTraversalDepth).toBe(DEFAULT_GRAPH_MAX_DEPTH);
  });
});
