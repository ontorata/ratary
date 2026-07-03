/**
 * Vendor-neutral graph traversal port.
 * Adapters: D1 flat relations (MVP), Neo4j, Memgraph, ArangoDB.
 * @see docs/adr/008-platform-architecture.md
 */
export type {
  IGraphProvider as IGraphStore,
  GraphTraversalOptions,
  GraphNeighbor,
  GraphCapabilities,
  GraphTraversalDirection,
} from '../../graph/igraph-provider.interface.js';

/** @deprecated Prefer IGraphStore for new adapters. */
export type { IGraphProvider } from '../../graph/igraph-provider.interface.js';
