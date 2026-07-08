import type { TransportContext } from '../transport-context.types.js';
import type { IScopeResolver } from '../../../scope/iscope-resolver.interface.js';
import type { MemoryScope } from '../../../types/memory-scope.js';
import type { Permission } from '../../../auth/permission-context.js';
import { assertMcpRemoteHandlerPermission } from '../../../auth/authorization-boundary.js';
import { resolveMemoryScopeFromTransportContext } from '../resolve-transport-scope.js';

export async function resolveHandlerScope(
  ctx: TransportContext,
  scopeResolver: IScopeResolver,
  requiredPermission?: Permission,
): Promise<MemoryScope> {
  if (requiredPermission && ctx.source === 'mcp-remote' && ctx.auth) {
    assertMcpRemoteHandlerPermission(ctx.auth, requiredPermission);
  }

  return resolveMemoryScopeFromTransportContext(ctx, scopeResolver);
}
