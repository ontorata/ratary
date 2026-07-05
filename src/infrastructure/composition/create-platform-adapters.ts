import type { D1Client } from '../../db/d1-client.js';
import type { IEmbeddingStore } from '../../embedding/embedding.store.interface.js';
import { D1EmbeddingStore } from '../../embedding/d1-embedding.store.js';
import { getEnv, type Env } from '../../config/index.js';
import type { IAnalyticsStore } from '../../ports/analytics/ianalytics-store.port.js';
import type { ICache } from '../../ports/cache/icache.port.js';
import type { IEventBus } from '../../ports/events/ievent-bus.port.js';
import type { IObjectStorage } from '../../ports/storage/iobject-storage.port.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IVectorStore } from '../../ports/vector/ivector-store.port.js';
import type { IOrganizationStore } from '../../ports/enterprise/iorganization-store.port.js';
import type { IWorkspaceMembership } from '../../ports/enterprise/iworkspace-membership.port.js';
import { AllowAllWorkspaceMembership } from '../enterprise/allow-all-workspace-membership.adapter.js';
import { D1OrganizationStore } from '../enterprise/d1-organization-store.adapter.js';
import { D1WorkspaceMembership } from '../enterprise/d1-workspace-membership.adapter.js';
import { createSqlDatabase } from './create-sql-database.js';
import { createObjectStorage } from './create-object-storage.js';
import { createVectorStore } from './create-vector-store.js';
import { createCache } from './create-cache.js';
import { createEventBus } from './create-event-bus.js';
import { createAnalyticsStore } from './create-analytics-store.js';

export interface PlatformAdapters {
  sql: ISqlDatabase;
  embeddingStore: IEmbeddingStore;
  vectorStore: IVectorStore;
  objectStorage: IObjectStorage;
  cache: ICache;
  eventBus: IEventBus;
  analyticsStore: IAnalyticsStore;
  workspaceMembership: IWorkspaceMembership;
  organizationStore: IOrganizationStore;
}

export function createPlatformAdapters(
  d1Client: D1Client | null,
  env: Env = getEnv(),
  injectedSql?: ISqlDatabase,
): PlatformAdapters {
  const sql = injectedSql ?? createSqlDatabase(d1Client, env);
  const embeddingStore = new D1EmbeddingStore(sql);
  const vectorStore = createVectorStore(env, sql, embeddingStore);

  const objectStorage = createObjectStorage(env);

  const cache = createCache(env);

  const eventBus = createEventBus(env);
  const analyticsStore = createAnalyticsStore(env);

  const workspaceMembership = env.ENTERPRISE_RBAC
    ? new D1WorkspaceMembership(sql)
    : new AllowAllWorkspaceMembership();

  const organizationStore = new D1OrganizationStore(sql);

  return {
    sql,
    embeddingStore,
    vectorStore,
    objectStorage,
    cache,
    eventBus,
    analyticsStore,
    workspaceMembership,
    organizationStore,
  };
}
