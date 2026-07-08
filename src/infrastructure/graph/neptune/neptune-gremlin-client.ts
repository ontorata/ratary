import type { RelationType } from '../../../types/knowledge.js';
import type { RelationEdge } from '../../../graph/traversal.js';

export interface NeptuneGremlinClient {
  submit(gremlin: string, bindings?: Record<string, unknown>): Promise<unknown>;
}

interface GremlinHttpResponse {
  result?: { data?: unknown };
}

/** HTTP Gremlin client for AWS Neptune (port 8182). */
export class HttpNeptuneGremlinClient implements NeptuneGremlinClient {
  constructor(private readonly endpoint: string) {}

  async submit(gremlin: string, bindings: Record<string, unknown> = {}): Promise<unknown> {
    const base = this.endpoint
      .replace(/\/+$/, '')
      .replace(/^wss:/, 'https:')
      .replace(/^ws:/, 'http:');
    const url = base.endsWith('/gremlin') ? base : `${base}/gremlin`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gremlin, bindings }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Neptune Gremlin HTTP ${response.status}: ${text.slice(0, 300)}`);
    }

    const payload = (await response.json()) as GremlinHttpResponse;
    return payload.result?.data ?? payload;
  }
}

/** Parse flat edge list from Gremlin project() results. */
export function parseNeptuneEdgeResults(data: unknown): RelationEdge[] {
  if (!Array.isArray(data)) return [];

  const edges: RelationEdge[] = [];
  for (const row of data) {
    if (!row || typeof row !== 'object') continue;
    const record = row as Record<string, unknown>;
    const source = extractMemoryId(record.source);
    const target = extractMemoryId(record.target);
    const relation = extractRelation(record.relation);
    if (source && target && relation) {
      edges.push({ sourceMemoryId: source, targetMemoryId: target, relation });
    }
  }
  return edges;
}

function extractMemoryId(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0) {
    return typeof value[0] === 'string' ? value[0] : null;
  }
  if (value && typeof value === 'object') {
    const map = value as Record<string, unknown>;
    const id = map.memory_id ?? map['memory_id'];
    if (typeof id === 'string') return id;
    if (Array.isArray(id) && typeof id[0] === 'string') return id[0];
  }
  return null;
}

function extractRelation(value: unknown): RelationType | null {
  if (typeof value === 'string') return value as RelationType;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0] as RelationType;
  if (value && typeof value === 'object') {
    const map = value as Record<string, unknown>;
    const rel = map.relation ?? map['relation'];
    if (typeof rel === 'string') return rel as RelationType;
    if (Array.isArray(rel) && typeof rel[0] === 'string') return rel[0] as RelationType;
  }
  return null;
}

export const NEPTUNE_OWNER_EDGES_GREMLIN = `
g.V().hasLabel('Memory').has('owner_id', ownerId)
  .outE('RELATES_TO').as('edge')
  .inV().hasLabel('Memory').has('owner_id', ownerId)
  .project('source', 'relation', 'target')
    .by(outV().values('memory_id'))
    .by(select('edge').values('relation'))
    .by(inV().values('memory_id'))
`;
