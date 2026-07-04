import { AsyncLocalStorage } from 'node:async_hooks';
import type { TransportContext } from '../../shared/transport-context.types.js';
import type { MemoryScope } from '../../../types/memory-scope.js';

export interface McpRemoteSession {
  ctx: TransportContext;
  resolveScope: () => Promise<MemoryScope>;
}

const remoteSessionStore = new AsyncLocalStorage<McpRemoteSession>();

export function runWithMcpRemoteSession<T>(session: McpRemoteSession, fn: () => T): T {
  return remoteSessionStore.run(session, fn);
}

export function getMcpRemoteSession(): McpRemoteSession {
  const session = remoteSessionStore.getStore();
  if (!session) {
    throw new Error('MCP remote session context is not initialized');
  }
  return session;
}

export function isInitializeRequest(body: unknown): boolean {
  if (typeof body !== 'object' || body === null) return false;
  const record = body as { method?: string; jsonrpc?: string };
  return record.jsonrpc === '2.0' && record.method === 'initialize';
}
