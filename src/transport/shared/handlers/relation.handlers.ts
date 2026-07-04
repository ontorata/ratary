import type { MemoryRelationService } from '../../../services/memory-relation.service.js';
import type { IScopeResolver } from '../../../scope/iscope-resolver.interface.js';
import type { CreateRelationInput } from '../../../types/knowledge.js';
import type { TransportContext } from '../transport-context.types.js';
import type { IApplicationHandler } from '../iapplication-handler.interface.js';
import { resolveHandlerScope } from './resolve-handler-scope.js';

export interface RelationHandlerDeps {
  relationService: MemoryRelationService;
  scopeResolver: IScopeResolver;
}

export interface RelationHandlers {
  list: IApplicationHandler<
    { memoryId: string },
    Awaited<ReturnType<MemoryRelationService['listRelations']>>
  >;
  create: IApplicationHandler<
    { memoryId: string; input: CreateRelationInput; identityId?: string },
    Awaited<ReturnType<MemoryRelationService['createRelation']>>
  >;
  delete: IApplicationHandler<{ memoryId: string; relationId: string }, void>;
}

export function createRelationHandlers(deps: RelationHandlerDeps): RelationHandlers {
  const scope = (ctx: TransportContext) => resolveHandlerScope(ctx, deps.scopeResolver);

  return {
    list: {
      handle: async (ctx, { memoryId }) =>
        deps.relationService.listRelations(await scope(ctx), memoryId),
    },
    create: {
      handle: async (ctx, { memoryId, input, identityId }) =>
        deps.relationService.createRelation(await scope(ctx), memoryId, input, identityId),
    },
    delete: {
      handle: async (ctx, { memoryId, relationId }) => {
        await deps.relationService.deleteRelation(await scope(ctx), memoryId, relationId);
      },
    },
  };
}
