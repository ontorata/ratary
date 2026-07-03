/**
 * Platform ports — storage-agnostic extension points.
 * Application and domain layers depend on these interfaces only.
 * @see docs/adr/008-platform-architecture.md
 */

export type { ISqlDatabase, SqlExecuteResult } from './sql/isql-database.port.js';

export type {
  IMemoryRepository,
  IMemoryReader,
  IMemoryWriter,
  RetrievalFilters,
} from './memory/imemory-repository.port.js';

export type {
  IRelationRepository,
  IMemoryRelationRepository,
} from './relation/irelation-repository.port.js';

export type {
  IEmbeddingProvider,
  EmbeddingInput,
  EmbeddingResult,
} from './embedding/iembedding-provider.port.js';

export type {
  IVectorStore,
  VectorScopeKey,
  StoredVector,
  VectorUpsertInput,
  VectorSearchMatch,
} from './vector/ivector-store.port.js';

export type {
  IGraphStore,
  IGraphProvider,
  GraphTraversalOptions,
  GraphNeighbor,
  GraphCapabilities,
  GraphTraversalDirection,
} from './graph/igraph-store.port.js';

export type {
  IObjectStorage,
  ObjectStorageKey,
  StoredObjectMetadata,
  StoredObject,
} from './storage/iobject-storage.port.js';

export type { ICache, CacheEntryOptions } from './cache/icache.port.js';

export type {
  IEventBus,
  EventEnvelope,
  EventSubscription,
} from './events/ievent-bus.port.js';

export type {
  IAnalyticsStore,
  AnalyticsQuery,
  AnalyticsRow,
} from './analytics/ianalytics-store.port.js';
