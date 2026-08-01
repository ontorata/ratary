import type {
  BuildContextRequest,
  BuildContextResult,
  BuildPromptResult,
  ContextService,
} from '../../../memory/context.service.js';
import type { ContextPackageLifecycleRecord } from '../../../ports/context/icontext-package-lifecycle-store.port.js';
import type { BuildContextBody } from '../../../types/context.js';
import type { IScopeResolver } from '../../../scope/iscope-resolver.interface.js';
import { PERMISSIONS } from '../../../auth/permission-context.js';
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
  getPackageLifecycle: IApplicationHandler<{ packageId: string }, ContextPackageLifecycleRecord>;
  retirePackage: IApplicationHandler<{ packageId: string }, ContextPackageLifecycleRecord>;
  archivePackage: IApplicationHandler<{ packageId: string }, ContextPackageLifecycleRecord>;
}

export function createContextHandlers(deps: ContextHandlerDeps): ContextHandlers {
  const scopeRead = (ctx: TransportContext) =>
    resolveHandlerScope(ctx, deps.scopeResolver, PERMISSIONS.MEMORY_READ);
  const scopeWrite = (ctx: TransportContext) =>
    resolveHandlerScope(ctx, deps.scopeResolver, PERMISSIONS.MEMORY_WRITE);
  const streamSource = deps.streamSource ?? new DefaultContextStreamSource(deps.contextService);

  return {
    buildContext: {
      handle: async (ctx, request) =>
        deps.contextService.buildContext(await scopeRead(ctx), {
          ...request,
          ...buildContextAuditFields(ctx),
        }),
    },
    buildPrompt: {
      handle: async (ctx, body) =>
        deps.contextService.buildPrompt(await scopeRead(ctx), {
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
        const resolvedScope = await scopeRead(ctx);
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
    getPackageLifecycle: {
      handle: async (ctx, input) =>
        deps.contextService.getPackageLifecycle(await scopeRead(ctx), input.packageId),
    },
    retirePackage: {
      handle: async (ctx, input) =>
        deps.contextService.retirePackage(await scopeWrite(ctx), input.packageId),
    },
    archivePackage: {
      handle: async (ctx, input) =>
        deps.contextService.archivePackage(await scopeWrite(ctx), input.packageId),
    },
  };
}
