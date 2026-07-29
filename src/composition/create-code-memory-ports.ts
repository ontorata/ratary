import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { CodeMemoryPorts } from '../knowledge/code-memory/icode-memory-store.js';
import {
  SqlCodeBridgeStore,
  SqlCodeEdgeStore,
  SqlCodeNodeStore,
} from '../knowledge/code-memory/sql-code-memory-store.js';

export function createCodeMemoryPorts(sql: ISqlDatabase, env: Env): CodeMemoryPorts {
  if (!env.CODE_MEMORY_ENABLED || env.CODE_STORE_PROVIDER !== 'sql') {
    return { enabled: false };
  }

  return {
    enabled: true,
    nodes: new SqlCodeNodeStore(sql),
    edges: new SqlCodeEdgeStore(sql),
    bridges: new SqlCodeBridgeStore(sql),
  };
}
