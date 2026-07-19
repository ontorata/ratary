import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IEntityMentionStore } from '../ports/entities/ientity-mention-store.port.js';
import type { IEntityRegistry } from '../ports/entities/ientity-registry.port.js';
import { SqlEntityRegistry } from '../infrastructure/entities/sql-entity-registry.js';
import { SqlEntityMentionStore } from '../infrastructure/entities/sql-entity-mention-store.js';
import { EntityResolver } from '../knowledge/entities/entity-resolver.js';

export type EntityResolutionPorts =
  | { enabled: false }
  | {
      enabled: true;
      registry: IEntityRegistry;
      resolver: EntityResolver;
      mentionStore: IEntityMentionStore;
    };

/**
 * Composition root for Phase 35 canonical entity resolution (ADR-068).
 * Gated by ENTITY_RESOLUTION_ENABLED + ENTITY_STORE_PROVIDER=sql; with the
 * flag off nothing is constructed and no port is registered anywhere (I0).
 */
export function createEntityResolutionPorts(sql: ISqlDatabase, env: Env): EntityResolutionPorts {
  if (!env.ENTITY_RESOLUTION_ENABLED || env.ENTITY_STORE_PROVIDER !== 'sql') {
    return { enabled: false };
  }

  const registry = new SqlEntityRegistry(sql);
  return {
    enabled: true,
    registry,
    resolver: new EntityResolver(registry),
    mentionStore: new SqlEntityMentionStore(sql),
  };
}
