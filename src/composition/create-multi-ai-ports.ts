import { AuditRepository } from '../auth/audit.repository.js';
import { D1AgentIdentity } from '../agent/d1-agent-identity.js';
import type { D1Client } from '../db/d1-client.js';
import { DefaultScopeResolver } from '../scope/default-scope-resolver.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { AcceptSyncManager } from '../sync/accept-sync-manager.js';
import type { IAgentIdentity } from '../agent/iagent-identity.interface.js';
import type { ISyncManager } from '../sync/isync-manager.interface.js';

export interface MultiAiPorts {
  scopeResolver: IScopeResolver;
  agentIdentity: IAgentIdentity;
  syncManager: ISyncManager;
}

/** Phase 9 composition-root factories — wired before controllers and MCP tools. */
export function createMultiAiPorts(db: D1Client): MultiAiPorts {
  const audit = new AuditRepository(db);
  return {
    scopeResolver: new DefaultScopeResolver(db),
    agentIdentity: new D1AgentIdentity(db),
    syncManager: new AcceptSyncManager(db, audit),
  };
}
