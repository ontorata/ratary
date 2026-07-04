import { AuditRepository } from '../auth/audit.repository.js';
import { D1AgentIdentity } from '../agent/d1-agent-identity.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { DefaultScopeResolver } from '../scope/default-scope-resolver.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import type { IAgentIdentity } from '../agent/iagent-identity.interface.js';
import type { ISyncManager } from '../sync/isync-manager.interface.js';
import type { Env } from '../config/env.js';
import { getEnv } from '../config/env.js';
import type { IClientSyncService } from '../client-sync/iclient-sync-service.interface.js';
import {
  createMultiClientSyncPorts,
  type MultiClientSyncPorts,
} from './create-multi-client-sync-ports.js';
import type { MemoryService } from '../services/memory.service.js';

export interface MultiAiPorts {
  scopeResolver: IScopeResolver;
  agentIdentity: IAgentIdentity;
  syncManager: ISyncManager;
  clientSync: MultiClientSyncPorts;
  bindClientSyncService(memoryService: MemoryService): IClientSyncService;
}

/** Phase 9 composition-root factories — wired before controllers and MCP tools. */
export function createMultiAiPorts(db: ISqlDatabase, env?: Env): MultiAiPorts {
  const envResolved = env ?? getEnv();
  const audit = new AuditRepository(db);
  const clientSync = createMultiClientSyncPorts(db, envResolved, audit);

  return {
    scopeResolver: new DefaultScopeResolver(db),
    agentIdentity: new D1AgentIdentity(db),
    syncManager: clientSync.syncManager,
    clientSync,
    bindClientSyncService: (memoryService: MemoryService) =>
      clientSync.createService(memoryService),
  };
}
