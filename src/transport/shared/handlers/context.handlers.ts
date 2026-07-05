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
import type { ContextChunk } from '../streaming/context-chunk.types.js';
import type { IContextStreamSource } from '../streaming/icontext-stream-source.interface.js';
import type { IStreamPublisher } from '../streaming/istream-publisher.interface.js';
import { DefaultContextStreamSource } from '../streaming/default-context-stream-source.js';
import { resolveHandlerScope } from './resolve-handler-scope.js';
import { buildContextAuditFields } from '../context-audit-fields.js';

export interface ContextHandlerDeps {
  contextService: ContextService;
  scopeResolver: IScopeResolver;
  streamSource?: IContextStreamSource;
}

export interface ContextStreamInput extends BuildContextRequest {
  publisher: IStreamPublisher<ContextChunk>;
}

export interface ContextHandlers {
  buildContext: IApplicationHandler<BuildContextRequest, BuildContextResult>;
  buildPrompt: IApplicationHandler<BuildContextBody, BuildPromptResult>;
  streamContext: IApplicationHandler<ContextStreamInput, void>;
}

export function createContextHandlers(deps: ContextHandlerDeps): ContextHandlers {
  const scope = (ctx: TransportContext) => resolveHandlerScope(ctx, deps.scopeResolver);
  const streamSource = deps.streamSource ?? new DefaultContextStreamSource(deps.contextService);

  return {
    buildContext: {
      handle: async (ctx, request) =>
        deps.contextService.buildContext(await scope(ctx), {
          ...request,
          ...buildContextAuditFields(ctx),
        }),
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
          ...buildContextAuditFields(ctx),
        }),
    },
    streamContext: {
      handle: async (ctx, input) => {
        const { publisher, ...request } = input;
        const resolvedScope = await scope(ctx);
        const auditedRequest = { ...request, ...buildContextAuditFields(ctx) };
        try {
          for await (const chunk of streamSource.stream(auditedRequest, resolvedScope)) {
            await publisher.publish(chunk);
          }
          await publisher.close();
        } catch (error) {
          await publisher.close(error instanceof Error ? error.message : 'stream failed');
          throw error;
        }
      },
    },
  };
}
