import type { GraphService } from '../../../services/graph.service.js';
import type { CodeMemoryService } from '../../../services/code-memory.service.js';
import type { IScopeResolver } from '../../../scope/iscope-resolver.interface.js';
import type { TraverseGraphBody } from '../../../types/graph.js';
import type { CodeNode, TraverseCodeBody } from '../../../types/code-memory.js';
import type { TransportContext } from '../transport-context.types.js';
import type { IApplicationHandler } from '../iapplication-handler.interface.js';
import { resolveHandlerScope } from './resolve-handler-scope.js';

export interface GraphHandlerDeps {
  graphService: GraphService;
  scopeResolver: IScopeResolver;
}

export interface GraphHandlers {
  getCapabilities: IApplicationHandler<
    Record<string, never>,
    ReturnType<GraphService['getCapabilities']>
  >;
  traverse: IApplicationHandler<
    TraverseGraphBody,
    Awaited<ReturnType<GraphService['traverseRelations']>>
  >;
  traverseCode: IApplicationHandler<
    TraverseCodeBody,
    Awaited<ReturnType<CodeMemoryService['traverse']>>
  >;
  getCodeNode: IApplicationHandler<{ id: string }, CodeNode | null>;
}

export function createGraphHandlers(deps: GraphHandlerDeps): GraphHandlers {
  const scope = (ctx: TransportContext) => resolveHandlerScope(ctx, deps.scopeResolver);

  return {
    getCapabilities: {
      handle: () => Promise.resolve(deps.graphService.getCapabilities()),
    },
    traverse: {
      handle: async (ctx, body) =>
        deps.graphService.traverseRelations(await scope(ctx), {
          memoryId: body.memoryId,
          depth: body.depth,
          types: body.types,
          direction: body.direction,
          seed: body.seed,
        }),
    },
    traverseCode: {
      handle: async (ctx, body) => {
        const resolved = await scope(ctx);
        return deps.graphService.getCodeMemory().traverse(resolved.ownerId, body);
      },
    },
    getCodeNode: {
      handle: async (ctx, body) => {
        const resolved = await scope(ctx);
        return deps.graphService.getCodeMemory().getNode(resolved.ownerId, body.id);
      },
    },
  };
}
