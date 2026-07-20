/**
 * Platform ports — storage-agnostic extension points.
 * Application and domain layers depend on these interfaces only.
 * @see .ai/adr/008-platform-architecture.md
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

export type { IEventBus, EventEnvelope, EventSubscription } from './events/ievent-bus.port.js';

export type {
  IAnalyticsStore,
  AnalyticsQuery,
  AnalyticsRow,
} from './analytics/ianalytics-store.port.js';

export type {
  IWorkspaceMembership,
  WorkspacePermission,
} from './enterprise/iworkspace-membership.port.js';

export type {
  IOrganizationStore,
  Organization,
  CreateOrganizationInput,
} from './enterprise/iorganization-store.port.js';

export type {
  IEntityRegistry,
  CreateEntityInput,
  UpdateEntityMetadataInput,
} from './entities/ientity-registry.port.js';

export type {
  IEntityResolver,
  SymbolInput,
  SymbolResolution,
} from './entities/ientity-resolver.port.js';

export type {
  IEntityMentionStore,
  UpsertEntityMentionInput,
} from './entities/ientity-mention-store.port.js';

export type {
  IProvenanceQuery,
  ChainWalkOptions,
  ProvenanceChainStep,
} from './provenance/iprovenance-query.port.js';
