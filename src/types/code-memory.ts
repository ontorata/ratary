/**
 * Unified Code Memory types — Phase 38 / ADR-070.
 *
 * Third graph plane (C1). Not MEMORY_TYPES and not ADR-068 ENTITY_KINDS.
 * Invariants: I1 immutable node id · I2 indexer_version evidence · I3 owner isolation.
 */
import { z } from 'zod';

export const CODE_NODE_KINDS = [
  'repository',
  'package',
  'module',
  'file',
  'class',
  'interface',
  'enum',
  'function',
  'method',
  'field',
  'type',
  'symbol',
] as const;

export const CODE_EDGE_TYPES = [
  'DECLARES',
  'BELONGS_TO',
  'CALLS',
  'IMPORTS',
  'EXPORTS',
  'IMPLEMENTS',
  'EXTENDS',
  'OVERRIDES',
  'DEPENDS_ON',
  'USES',
  'REFERENCES',
  'READS',
  'WRITES',
  'INSTANTIATES',
  'RETURNS',
  'THROWS',
  'ANNOTATED_BY',
] as const;

export const CODE_BRIDGE_TYPES = [
  'CODE_DOCUMENTED_BY',
  'CODE_IMPLEMENTS_INTENT',
  'CODE_GROUNDS_ENTITY',
] as const;

/** Bumped when extractor rule set changes (I2). */
export const CODE_INDEXER_VERSION = 'ts-api-1.0';

export type CodeNodeKind = (typeof CODE_NODE_KINDS)[number];
export type CodeEdgeType = (typeof CODE_EDGE_TYPES)[number];
export type CodeBridgeType = (typeof CODE_BRIDGE_TYPES)[number];

export const codeNodeKindSchema = z.enum(CODE_NODE_KINDS);
export const codeEdgeTypeSchema = z.enum(CODE_EDGE_TYPES);
export const codeBridgeTypeSchema = z.enum(CODE_BRIDGE_TYPES);

export interface CodeSourceRange {
  path: string;
  startLine: number;
  endLine: number;
  startByte?: number;
  endByte?: number;
}

export interface CodeNode {
  id: string;
  ownerId: string;
  kind: CodeNodeKind;
  repoId: string | null;
  stableKey: string;
  displayName: string;
  language: string | null;
  sourceRange: CodeSourceRange | null;
  contentHash: string | null;
  indexerVersion: string;
  indexedAt: string;
}

export interface CodeEdgeEvidence {
  indexerVersion: string;
  rule: string;
  repoCommit: string | null;
  confidence?: number;
}

export interface CodeEdge {
  id: string;
  ownerId: string;
  type: CodeEdgeType;
  fromId: string;
  toId: string;
  evidence: CodeEdgeEvidence;
  createdAt: string;
}

export interface CodeBridge {
  id: string;
  ownerId: string;
  type: CodeBridgeType;
  codeNodeId: string;
  /** Memory id or canonical entity id depending on bridge type. */
  targetId: string;
  targetPlane: 'memory' | 'entity';
  evidence: Record<string, unknown>;
  createdAt: string;
}

export const traverseCodeBodySchema = z.object({
  codeNodeId: z.string().uuid().optional(),
  stableKey: z.string().min(1).optional(),
  seed: z
    .object({
      repository: z.string().min(1).optional(),
      path: z.string().min(1).optional(),
      symbol: z.string().min(1).optional(),
    })
    .optional(),
  depth: z.number().int().min(1).max(5).optional(),
  kinds: z.array(codeNodeKindSchema).optional(),
  types: z.array(codeEdgeTypeSchema).optional(),
  direction: z.enum(['outgoing', 'incoming', 'both']).optional(),
});

export type TraverseCodeBody = z.infer<typeof traverseCodeBodySchema>;
