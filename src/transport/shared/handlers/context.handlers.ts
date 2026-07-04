import type {
  BuildContextRequest,
  BuildContextResult,
  BuildPromptResult,
  ContextService,
} from '../../../memory/context.service.js';
import type { BuildContextBody } from '../../../types/context.js';
import type { IScopeResolver } from '../../../scope/iscope-resolver.interface.js';
import type { TransportContext } from '../transport-context.types.js';
import type { IApplicationHandler } from '../iapplication-handler.interface.js';
import { resolveHandlerScope } from './resolve-handler-scope.js';

export interface ContextHandlerDeps {
  contextService: ContextService;
  scopeResolver: IScopeResolver;
}

export interface ContextHandlers {
  buildContext: IApplicationHandler<BuildContextRequest, BuildContextResult>;
  buildPrompt: IApplicationHandler<BuildContextBody, BuildPromptResult>;
}

export function createContextHandlers(deps: ContextHandlerDeps): ContextHandlers {
  const scope = (ctx: TransportContext) => resolveHandlerScope(ctx, deps.scopeResolver);

  return {
    buildContext: {
      handle: async (ctx, request) => deps.contextService.buildContext(await scope(ctx), request),
    },
    buildPrompt: {
      handle: async (ctx, body) =>
        deps.contextService.buildPrompt(await scope(ctx), {
          projectId: body.projectId,
          query: body.query,
          tags: body.tags,
          levels: body.levels,
          limit: body.limit,
          context: body.context,
          task: body.task,
          systemRole: body.systemRole,
        }),
    },
  };
}
