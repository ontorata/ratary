import type { CodeMemoryPorts } from '../knowledge/code-memory/icode-memory-store.js';
import type {
  CodeEdge,
  CodeEdgeType,
  CodeNode,
  CodeNodeKind,
  TraverseCodeBody,
} from '../types/code-memory.js';
import { CODE_EDGE_TYPES, CODE_NODE_KINDS } from '../types/code-memory.js';

export interface CodeGraphCapabilitiesExtra {
  supportsCodeGraph: boolean;
  codeTraversalEnabled: boolean;
  maxCodeTraversalDepth: number;
  maxCodeNeighborsPerRequest: number;
  codeNodeKinds: readonly string[];
  codeEdgeTypes: readonly string[];
}

export interface CodeNeighbor {
  node: CodeNode;
  depth: number;
  edgeType: CodeEdgeType;
  direction: 'outgoing' | 'incoming';
}

const DEFAULT_MAX_DEPTH = 3;
const DEFAULT_MAX_NEIGHBORS = 50;

export class CodeMemoryService {
  constructor(
    private readonly ports: CodeMemoryPorts,
    private readonly limits: { maxDepth: number; maxNeighbors: number } = {
      maxDepth: DEFAULT_MAX_DEPTH,
      maxNeighbors: DEFAULT_MAX_NEIGHBORS,
    },
  ) {}

  capabilitiesExtra(): CodeGraphCapabilitiesExtra {
    const enabled = this.ports.enabled;
    return {
      supportsCodeGraph: true,
      codeTraversalEnabled: enabled,
      maxCodeTraversalDepth: this.limits.maxDepth,
      maxCodeNeighborsPerRequest: this.limits.maxNeighbors,
      codeNodeKinds: CODE_NODE_KINDS,
      codeEdgeTypes: CODE_EDGE_TYPES,
    };
  }

  async getNode(ownerId: string, id: string): Promise<CodeNode | null> {
    if (!this.ports.enabled) return null;
    return this.ports.nodes.getById(ownerId, id);
  }

  async traverse(
    ownerId: string,
    body: TraverseCodeBody,
  ): Promise<{ nodeIds: string[]; neighbors: CodeNeighbor[]; enabled: boolean }> {
    if (!this.ports.enabled) {
      return { nodeIds: [], neighbors: [], enabled: false };
    }

    const seed = await this.resolveSeed(ownerId, body);
    if (!seed) {
      return { nodeIds: [], neighbors: [], enabled: true };
    }

    const maxDepth = Math.min(body.depth ?? this.limits.maxDepth, this.limits.maxDepth);
    const direction = body.direction ?? 'both';
    const types = body.types;
    const kindFilter = body.kinds ? new Set<CodeNodeKind>(body.kinds) : null;

    const visited = new Set<string>([seed.id]);
    const neighbors: CodeNeighbor[] = [];
    let frontier: Array<{ id: string; depth: number }> = [{ id: seed.id, depth: 0 }];
    let budget = this.limits.maxNeighbors;

    while (frontier.length > 0 && budget > 0) {
      const next: Array<{ id: string; depth: number }> = [];
      for (const item of frontier) {
        if (item.depth >= maxDepth || budget <= 0) continue;
        const edges = await this.ports.edges.listNeighbors(ownerId, item.id, {
          direction,
          types,
          limit: budget,
        });
        for (const edge of edges) {
          if (budget <= 0) break;
          const hop = this.hopFromEdge(item.id, edge);
          if (!hop || visited.has(hop.nodeId)) continue;
          const node = await this.ports.nodes.getById(ownerId, hop.nodeId);
          if (!node) continue;
          if (kindFilter && !kindFilter.has(node.kind)) {
            visited.add(node.id);
            continue;
          }
          visited.add(node.id);
          neighbors.push({
            node,
            depth: item.depth + 1,
            edgeType: edge.type,
            direction: hop.direction,
          });
          budget -= 1;
          next.push({ id: node.id, depth: item.depth + 1 });
        }
      }
      frontier = next;
    }

    return {
      nodeIds: [...visited],
      neighbors,
      enabled: true,
    };
  }

  private hopFromEdge(
    fromId: string,
    edge: CodeEdge,
  ): { nodeId: string; direction: 'outgoing' | 'incoming' } | null {
    if (edge.fromId === fromId) return { nodeId: edge.toId, direction: 'outgoing' };
    if (edge.toId === fromId) return { nodeId: edge.fromId, direction: 'incoming' };
    return null;
  }

  private async resolveSeed(ownerId: string, body: TraverseCodeBody): Promise<CodeNode | null> {
    if (!this.ports.enabled) return null;
    if (body.codeNodeId) {
      return this.ports.nodes.getById(ownerId, body.codeNodeId);
    }
    if (body.stableKey) {
      return this.ports.nodes.getByStableKey(ownerId, body.stableKey);
    }
    const seed = body.seed;
    if (!seed) return null;
    if (seed.repository && seed.path && seed.symbol) {
      const key = `file:${seed.repository}:${seed.path}#${seed.symbol}`;
      return this.ports.nodes.getByStableKey(ownerId, key);
    }
    if (seed.repository && seed.path) {
      return this.ports.nodes.getByStableKey(ownerId, `file:${seed.repository}:${seed.path}`);
    }
    if (seed.repository) {
      return this.ports.nodes.getByStableKey(ownerId, `repo:${seed.repository}`);
    }
    return null;
  }
}

export function createCodeMemoryService(ports: CodeMemoryPorts): CodeMemoryService {
  return new CodeMemoryService(ports);
}
