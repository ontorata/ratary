import type {
  CodeBridge,
  CodeBridgeType,
  CodeEdge,
  CodeEdgeType,
  CodeNode,
  CodeNodeKind,
} from '../../types/code-memory.js';

export interface ICodeNodeStore {
  upsertNode(node: CodeNode): Promise<void>;
  getById(ownerId: string, id: string): Promise<CodeNode | null>;
  getByStableKey(ownerId: string, stableKey: string): Promise<CodeNode | null>;
  listByRepo(ownerId: string, repoId: string, kinds?: CodeNodeKind[]): Promise<CodeNode[]>;
}

export interface ICodeEdgeStore {
  upsertEdge(edge: CodeEdge): Promise<void>;
  listNeighbors(
    ownerId: string,
    nodeId: string,
    options: {
      direction: 'outgoing' | 'incoming' | 'both';
      types?: CodeEdgeType[];
      limit: number;
    },
  ): Promise<CodeEdge[]>;
}

export interface ICodeBridgeStore {
  upsertBridge(bridge: CodeBridge): Promise<void>;
  listByCodeNode(ownerId: string, codeNodeId: string, types?: CodeBridgeType[]): Promise<CodeBridge[]>;
}

export type CodeMemoryPorts =
  | { enabled: false }
  | {
      enabled: true;
      nodes: ICodeNodeStore;
      edges: ICodeEdgeStore;
      bridges: ICodeBridgeStore;
    };
