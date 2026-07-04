import type { TransportContext } from '../shared/transport-context.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import {
  buildTransportContextFromMcpEnv,
  resolveMcpMemoryScope,
  resolveMemoryScopeFromTransportContext,
} from '../shared/resolve-transport-scope.js';
import type { IScopeResolver } from '../../scope/iscope-resolver.interface.js';
import { getMcpRemoteSession } from './remote/mcp-remote-context.js';

/** Per-call context binding for MCP tool dispatch. */
export interface McpContextBinding {
  getTransportContext(): TransportContext;
  resolveMemoryScope(): Promise<MemoryScope>;
}

export function createStdioMcpBinding(scopeResolver: IScopeResolver): McpContextBinding {
  return {
    getTransportContext: () => buildTransportContextFromMcpEnv(),
    resolveMemoryScope: () => resolveMcpMemoryScope(scopeResolver),
  };
}

export function createRemoteMcpBinding(_scopeResolver: IScopeResolver): McpContextBinding {
  return {
    getTransportContext: () => getMcpRemoteSession().ctx,
    resolveMemoryScope: () => getMcpRemoteSession().resolveScope(),
  };
}

export function createRestMcpBinding(
  ctx: TransportContext,
  scopeResolver: IScopeResolver,
): McpContextBinding {
  const remoteCtx: TransportContext = { ...ctx, source: 'mcp-remote' };
  return {
    getTransportContext: () => remoteCtx,
    resolveMemoryScope: () => resolveMemoryScopeFromTransportContext(remoteCtx, scopeResolver),
  };
}
