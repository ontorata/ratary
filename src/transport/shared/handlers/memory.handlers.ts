import type { MemoryService } from '../../../services/memory.service.js';
import type { IScopeResolver } from '../../../scope/iscope-resolver.interface.js';
import type {
  BackupImportInput,
  CreateMemoryInput,
  ListMemoriesQuery,
  Memory,
  SearchQuery,
  UpdateMemoryInput,
} from '../../../types/memory.js';
import type { TransportContext } from '../transport-context.types.js';
import type { IApplicationHandler } from '../iapplication-handler.interface.js';
import { resolveHandlerScope } from './resolve-handler-scope.js';

export interface MemoryHandlerDeps {
  memoryService: MemoryService;
  scopeResolver: IScopeResolver;
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
  listProjects: IApplicationHandler<Record<string, never>, string[]>;
  listTags: IApplicationHandler<Record<string, never>, string[]>;
  toggleFavorite: IApplicationHandler<{ id: string }, Memory>;
  archive: IApplicationHandler<{ id: string }, Memory>;
  exportBackup: IApplicationHandler<Record<string, never>, Awaited<ReturnType<MemoryService['exportBackup']>>>;
  importBackup: IApplicationHandler<{ input: BackupImportInput }, Awaited<ReturnType<MemoryService['importBackup']>>>;
  replaceBackup: IApplicationHandler<{ input: BackupImportInput }, Awaited<ReturnType<MemoryService['replaceBackup']>>>;
}

export function createMemoryHandlers(deps: MemoryHandlerDeps): MemoryHandlers {
  const scope = (ctx: TransportContext) => resolveHandlerScope(ctx, deps.scopeResolver);

  return {
    create: {
      handle: async (ctx, input) => deps.memoryService.createMemory(await scope(ctx), input),
    },
    getById: {
      handle: async (ctx, { id }) => deps.memoryService.getMemoryById(await scope(ctx), id),
    },
    getByCodename: {
      handle: async (ctx, { codename }) =>
        deps.memoryService.getMemoryByCodename(await scope(ctx), codename),
    },
    getBySlug: {
      handle: async (ctx, { slug }) => deps.memoryService.getMemoryBySlug(await scope(ctx), slug),
    },
    update: {
      handle: async (ctx, { id, input }) =>
        deps.memoryService.updateMemory(await scope(ctx), id, input),
    },
    delete: {
      handle: async (ctx, { id }) => {
        await deps.memoryService.deleteMemory(await scope(ctx), id);
      },
    },
    list: {
      handle: async (ctx, query) => deps.memoryService.listMemories(await scope(ctx), query),
    },
    search: {
      handle: async (ctx, query) => deps.memoryService.searchMemory(await scope(ctx), query),
    },
    listProjects: {
      handle: async (ctx) => deps.memoryService.listProjects(await scope(ctx)),
    },
    listTags: {
      handle: async (ctx) => deps.memoryService.listTags(await scope(ctx)),
    },
    toggleFavorite: {
      handle: async (ctx, { id }) => deps.memoryService.toggleFavorite(await scope(ctx), id),
    },
    archive: {
      handle: async (ctx, { id }) => deps.memoryService.archiveMemory(await scope(ctx), id, true),
    },
    exportBackup: {
      handle: async (ctx) => deps.memoryService.exportBackup(await scope(ctx)),
    },
    importBackup: {
      handle: async (ctx, { input }) => deps.memoryService.importBackup(await scope(ctx), input),
    },
    replaceBackup: {
      handle: async (ctx, { input }) => deps.memoryService.replaceBackup(await scope(ctx), input),
    },
  };
}
