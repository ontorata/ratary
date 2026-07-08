import type { MemoryService } from '../../../services/memory.service.js';
import type { IScopeResolver } from '../../../scope/iscope-resolver.interface.js';
import type { IMemoryAccessAuditor } from '../../../ports/audit/imemory-access-auditor.port.js';
import { PERMISSIONS } from '../../../auth/permission-context.js';
import type {
  BackupImportInput,
  CreateMemoryInput,
  ListMemoriesQuery,
  Memory,
  SearchQuery,
  UpdateMemoryInput,
} from '../../../types/memory.js';
import type { ByPathQueryInput, SimilarMemoryQueryInput } from '../../../types/precision-search.js';
import type { TransportContext } from '../transport-context.types.js';
import type { IApplicationHandler } from '../iapplication-handler.interface.js';
import { resolveHandlerScope } from './resolve-handler-scope.js';
import { auditMemoryRead } from '../audit-memory-read.js';

export interface MemoryHandlerDeps {
  memoryService: MemoryService;
  scopeResolver: IScopeResolver;
  memoryAccessAuditor?: IMemoryAccessAuditor;
}

export interface MemoryHandlers {
  create: IApplicationHandler<CreateMemoryInput, Memory>;
  getById: IApplicationHandler<{ id: string }, Memory>;
  getByCodename: IApplicationHandler<{ codename: string }, Memory>;
  getBySlug: IApplicationHandler<{ slug: string }, Memory>;
  update: IApplicationHandler<{ id: string; input: UpdateMemoryInput }, Memory>;
  delete: IApplicationHandler<{ id: string }, void>;
  list: IApplicationHandler<ListMemoriesQuery, Awaited<ReturnType<MemoryService['listMemories']>>>;
  search: IApplicationHandler<SearchQuery, Awaited<ReturnType<MemoryService['searchMemory']>>>;
  findSimilar: IApplicationHandler<
    SimilarMemoryQueryInput,
    Awaited<ReturnType<MemoryService['findSimilarMemories']>>
  >;
  getByPath: IApplicationHandler<
    ByPathQueryInput,
    Awaited<ReturnType<MemoryService['getMemoryByPath']>>
  >;
  listProjects: IApplicationHandler<Record<string, never>, string[]>;
  listTags: IApplicationHandler<Record<string, never>, string[]>;
  toggleFavorite: IApplicationHandler<{ id: string }, Memory>;
  archive: IApplicationHandler<{ id: string }, Memory>;
  exportBackup: IApplicationHandler<
    Record<string, never>,
    Awaited<ReturnType<MemoryService['exportBackup']>>
  >;
  importBackup: IApplicationHandler<
    { input: BackupImportInput },
    Awaited<ReturnType<MemoryService['importBackup']>>
  >;
  replaceBackup: IApplicationHandler<
    { input: BackupImportInput },
    Awaited<ReturnType<MemoryService['replaceBackup']>>
  >;
}

export function createMemoryHandlers(deps: MemoryHandlerDeps): MemoryHandlers {
  const readScope = (ctx: TransportContext) =>
    resolveHandlerScope(ctx, deps.scopeResolver, PERMISSIONS.MEMORY_READ);
  const writeScope = (ctx: TransportContext) =>
    resolveHandlerScope(ctx, deps.scopeResolver, PERMISSIONS.MEMORY_WRITE);

  return {
    create: {
      handle: async (ctx, input) => deps.memoryService.createMemory(await writeScope(ctx), input),
    },
    getById: {
      handle: async (ctx, { id }) => {
        const resolvedScope = await readScope(ctx);
        const memory = await deps.memoryService.getMemoryById(resolvedScope, id);
        await auditMemoryRead(deps.memoryAccessAuditor, ctx, resolvedScope, memory.id);
        return memory;
      },
    },
    getByCodename: {
      handle: async (ctx, { codename }) => {
        const resolvedScope = await readScope(ctx);
        const memory = await deps.memoryService.getMemoryByCodename(resolvedScope, codename);
        await auditMemoryRead(deps.memoryAccessAuditor, ctx, resolvedScope, memory.id);
        return memory;
      },
    },
    getBySlug: {
      handle: async (ctx, { slug }) => {
        const resolvedScope = await readScope(ctx);
        const memory = await deps.memoryService.getMemoryBySlug(resolvedScope, slug);
        await auditMemoryRead(deps.memoryAccessAuditor, ctx, resolvedScope, memory.id);
        return memory;
      },
    },
    update: {
      handle: async (ctx, { id, input }) =>
        deps.memoryService.updateMemory(await writeScope(ctx), id, input),
    },
    delete: {
      handle: async (ctx, { id }) => {
        await deps.memoryService.deleteMemory(await writeScope(ctx), id);
      },
    },
    list: {
      handle: async (ctx, query) => deps.memoryService.listMemories(await readScope(ctx), query),
    },
    search: {
      handle: async (ctx, query) => deps.memoryService.searchMemory(await readScope(ctx), query),
    },
    findSimilar: {
      handle: async (ctx, query) =>
        deps.memoryService.findSimilarMemories(await readScope(ctx), query),
    },
    getByPath: {
      handle: async (ctx, query) => deps.memoryService.getMemoryByPath(await readScope(ctx), query),
    },
    listProjects: {
      handle: async (ctx) => deps.memoryService.listProjects(await readScope(ctx)),
    },
    listTags: {
      handle: async (ctx) => deps.memoryService.listTags(await readScope(ctx)),
    },
    toggleFavorite: {
      handle: async (ctx, { id }) => deps.memoryService.toggleFavorite(await writeScope(ctx), id),
    },
    archive: {
      handle: async (ctx, { id }) =>
        deps.memoryService.archiveMemory(await writeScope(ctx), id, true),
    },
    exportBackup: {
      handle: async (ctx) => deps.memoryService.exportBackup(await readScope(ctx)),
    },
    importBackup: {
      handle: async (ctx, { input }) =>
        deps.memoryService.importBackup(await writeScope(ctx), input),
    },
    replaceBackup: {
      handle: async (ctx, { input }) =>
        deps.memoryService.replaceBackup(await writeScope(ctx), input),
    },
  };
}
