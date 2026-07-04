import type { TransportContext } from '../transport-context.types.js';
import type { IScopeResolver } from '../../../scope/iscope-resolver.interface.js';
import type { MemoryScope } from '../../../types/memory-scope.js';
import { resolveMemoryScopeFromTransportContext } from '../resolve-transport-scope.js';

export async function resolveHandlerScope(
  ctx: TransportContext,
  scopeResolver: IScopeResolver,
): Promise<MemoryScope> {
  return resolveMemoryScopeFromTransportContext(ctx, scopeResolver);
}
