import { describe, expect, it } from 'vitest';
import { walkEffectChain, walkWhyChain, type ProvenanceWalkEdge } from './chain-walk.js';

function edge(id: string, source: string, target: string, relation: string): ProvenanceWalkEdge {
  return { id, sourceMemoryId: source, targetMemoryId: target, relation };
}

describe('walkWhyChain (ADR-069 D5)', () => {
  it('follows motivated_by and caused_by outgoing only', () => {
    const edges = [
      edge('e2', 'dec', 'constraint', 'motivated_by'),
      edge('e1', 'dec', 'prior', 'caused_by'),
      edge('e3', 'dec', 'outcome', 'resulted_in'),
      edge('e4', 'dec', 'related', 'depends_on'),
    ];
    const chain = walkWhyChain(edges, 'dec');
    expect(chain.map((s) => s.memoryId)).toEqual(['prior', 'constraint']);
    expect(chain.map((s) => s.viaEdgeId)).toEqual(['e1', 'e2']);
    expect(chain.every((s) => s.depth === 1)).toBe(true);
  });

  it('is deterministic and cycle-safe', () => {
    const edges = [
      edge('a', 'm1', 'm2', 'caused_by'),
      edge('b', 'm2', 'm3', 'motivated_by'),
      edge('c', 'm3', 'm1', 'caused_by'),
    ];
    const first = walkWhyChain(edges, 'm1');
    const second = walkWhyChain(edges, 'm1');
    expect(first).toEqual(second);
    expect(first.map((s) => s.memoryId)).toEqual(['m2', 'm3']);
  });

  it('respects maxDepth and budget', () => {
    const edges = [
      edge('a', 'm1', 'm2', 'caused_by'),
      edge('b', 'm2', 'm3', 'caused_by'),
      edge('c', 'm3', 'm4', 'caused_by'),
    ];
    expect(walkWhyChain(edges, 'm1', { maxDepth: 1 }).map((s) => s.memoryId)).toEqual(['m2']);
    expect(walkWhyChain(edges, 'm1', { budget: 2 }).map((s) => s.memoryId)).toEqual(['m2', 'm3']);
  });

  it('does not mutate input edges', () => {
    const edges = [edge('z', 'dec', 'b', 'motivated_by'), edge('a', 'dec', 'c', 'caused_by')];
    const snapshot = structuredClone(edges);
    walkWhyChain(edges, 'dec');
    expect(edges).toEqual(snapshot);
  });
});

describe('walkEffectChain (ADR-069 D5)', () => {
  it('follows resulted_in and supersedes outgoing only', () => {
    const edges = [
      edge('e9', 'dec', 'old', 'supersedes'),
      edge('e1', 'dec', 'out', 'resulted_in'),
      edge('e2', 'dec', 'prior', 'caused_by'),
    ];
    const chain = walkEffectChain(edges, 'dec');
    expect(chain.map((s) => ({ id: s.memoryId, via: s.viaEdgeId, rel: s.relation }))).toEqual([
      { id: 'out', via: 'e1', rel: 'resulted_in' },
      { id: 'old', via: 'e9', rel: 'supersedes' },
    ]);
  });
});
