import type {
  UntypedServiceImplementation,
  sendUnaryData,
  ServerUnaryCall,
  ServerWritableStream,
} from '@grpc/grpc-js';
import type { TransportHandlers } from '../shared/handlers/create-transport-handlers.js';
import { buildTransportContextFromGrpcMetadata } from '../shared/resolve-transport-scope.js';
import { MEMORY_LEVELS, type MemoryLevel } from '../../types/memory-level.js';
import type { CreateMemoryInput, SearchQuery } from '../../types/memory.js';
import { grpcMetadataToTransport, toProtoMemory, type ProtoMemory } from './grpc-mappers.js';
import { toGrpcError } from './grpc-error.js';

interface CreateMemoryRequest {
  title: string;
  content: string;
  project: string;
  summary: string;
  tags: string[];
  favorite: boolean;
  category: string;
  memory_type: string;
  keywords: string[];
  importance: number;
  language: string;
  notes: string;
  level: string;
}

interface GetMemoryRequest {
  id: string;
}

interface UpdateMemoryRequest {
  id: string;
  title: string;
  content: string;
  project: string;
  summary: string;
  tags: string[];
  favorite: boolean;
}

interface DeleteMemoryRequest {
  id: string;
}

interface ListMemoriesRequest {
  project: string;
  favorite: boolean;
  archived: boolean;
  limit: number;
  offset: number;
}

interface SearchRequest {
  q: string;
  tag: string;
  project: string;
  category: string;
  memory_type: string;
  importance_min: number;
  favorite: boolean;
  archived: boolean;
  limit: number;
  offset: number;
}

interface BuildContextRequest {
  query: string;
  project_id: string;
  tags: string[];
  levels: string[];
  limit: number;
  max_chars: number;
  summary_only: boolean;
  format: string;
}

function coerceLevels(levels: string[]): MemoryLevel[] | undefined {
  const filtered = levels.filter((l): l is MemoryLevel =>
    (MEMORY_LEVELS as readonly string[]).includes(l),
  );
  return filtered.length > 0 ? filtered : undefined;
}

function emptyToUndefined(value: string): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

/**
 * Builds gRPC service implementations bound to shared handlers (ADR-027 Phase 10.5E).
 * No business logic — protocol encode/decode + scope bootstrap only.
 */
export function createGrpcServiceImplementations(handlers: TransportHandlers): {
  memory: UntypedServiceImplementation;
  search: UntypedServiceImplementation;
  context: UntypedServiceImplementation;
  health: UntypedServiceImplementation;
} {
  const ctxOf = (metadata: Parameters<typeof grpcMetadataToTransport>[0]) =>
    buildTransportContextFromGrpcMetadata(grpcMetadataToTransport(metadata));

  const memory = {
    CreateMemory: (
      call: ServerUnaryCall<CreateMemoryRequest, ProtoMemory>,
      callback: sendUnaryData<ProtoMemory>,
    ): void => {
      const req = call.request;
      handlers.memory.create
        .handle(ctxOf(call.metadata), {
          title: req.title,
          content: req.content,
          project: req.project ?? '',
          summary: req.summary ?? '',
          tags: req.tags ?? [],
          favorite: req.favorite ?? false,
          category: emptyToUndefined(req.category) as CreateMemoryInput['category'],
          memoryType: emptyToUndefined(req.memory_type) as CreateMemoryInput['memoryType'],
          keywords: req.keywords?.length ? req.keywords : undefined,
          importance: req.importance || undefined,
          language: emptyToUndefined(req.language),
          notes: emptyToUndefined(req.notes),
          level: coerceLevels([req.level])?.[0],
        })
        .then((memoryEntity) => callback(null, toProtoMemory(memoryEntity)))
        .catch((error: unknown) => callback(toGrpcError(error)));
    },

    GetMemory: (
      call: ServerUnaryCall<GetMemoryRequest, ProtoMemory>,
      callback: sendUnaryData<ProtoMemory>,
    ): void => {
      handlers.memory.getById
        .handle(ctxOf(call.metadata), { id: call.request.id })
        .then((memoryEntity) => callback(null, toProtoMemory(memoryEntity)))
        .catch((error: unknown) => callback(toGrpcError(error)));
    },

    UpdateMemory: (
      call: ServerUnaryCall<UpdateMemoryRequest, ProtoMemory>,
      callback: sendUnaryData<ProtoMemory>,
    ): void => {
      const req = call.request;
      handlers.memory.update
        .handle(ctxOf(call.metadata), {
          id: req.id,
          input: {
            title: emptyToUndefined(req.title),
            content: emptyToUndefined(req.content),
            project: emptyToUndefined(req.project),
            summary: emptyToUndefined(req.summary),
            tags: req.tags?.length ? req.tags : undefined,
            favorite: req.favorite,
          },
        })
        .then((memoryEntity) => callback(null, toProtoMemory(memoryEntity)))
        .catch((error: unknown) => callback(toGrpcError(error)));
    },

    DeleteMemory: (
      call: ServerUnaryCall<DeleteMemoryRequest, { deleted: boolean }>,
      callback: sendUnaryData<{ deleted: boolean }>,
    ): void => {
      handlers.memory.delete
        .handle(ctxOf(call.metadata), { id: call.request.id })
        .then(() => callback(null, { deleted: true }))
        .catch((error: unknown) => callback(toGrpcError(error)));
    },

    ListMemories: (
      call: ServerUnaryCall<ListMemoriesRequest, { memories: ProtoMemory[]; total: number }>,
      callback: sendUnaryData<{ memories: ProtoMemory[]; total: number }>,
    ): void => {
      const req = call.request;
      handlers.memory.list
        .handle(ctxOf(call.metadata), {
          project: emptyToUndefined(req.project),
          favorite: req.favorite,
          archived: req.archived,
          limit: req.limit || 50,
          offset: req.offset || 0,
        })
        .then((result) =>
          callback(null, { memories: result.memories.map(toProtoMemory), total: result.total }),
        )
        .catch((error: unknown) => callback(toGrpcError(error)));
    },
  } satisfies Record<string, unknown> as unknown as UntypedServiceImplementation;

  const search = {
    Search: (
      call: ServerUnaryCall<SearchRequest, { results: ProtoMemory[]; total: number }>,
      callback: sendUnaryData<{ results: ProtoMemory[]; total: number }>,
    ): void => {
      const req = call.request;
      handlers.memory.search
        .handle(ctxOf(call.metadata), {
          q: emptyToUndefined(req.q),
          tag: emptyToUndefined(req.tag),
          project: emptyToUndefined(req.project),
          category: emptyToUndefined(req.category),
          memory_type: emptyToUndefined(req.memory_type) as SearchQuery['memory_type'],
          importance_min: req.importance_min || undefined,
          favorite: req.favorite,
          archived: req.archived ?? false,
          limit: req.limit || 50,
          offset: req.offset || 0,
        })
        .then((result) =>
          callback(null, { results: result.memories.map(toProtoMemory), total: result.total }),
        )
        .catch((error: unknown) => callback(toGrpcError(error)));
    },
  } satisfies Record<string, unknown> as unknown as UntypedServiceImplementation;

  const context = {
    BuildContext: (
      call: ServerWritableStream<BuildContextRequest, { kind: string; payload: string }>,
    ): void => {
      const req = call.request;
      handlers.context.buildContext
        .handle(ctxOf(call.metadata), {
          query: emptyToUndefined(req.query),
          projectId: emptyToUndefined(req.project_id),
          tags: req.tags?.length ? req.tags : undefined,
          levels: coerceLevels(req.levels ?? []),
          limit: req.limit || undefined,
          context: {
            maxChars: req.max_chars || undefined,
            includeSummaryOnly: req.summary_only,
            format: (emptyToUndefined(req.format) as 'markdown' | 'xml' | undefined) ?? undefined,
          },
        })
        .then((result) => {
          call.write({
            kind: 'meta',
            payload: JSON.stringify({ totalCandidates: result.totalCandidates }),
          });
          for (const scored of result.memories) {
            call.write({ kind: 'memory', payload: JSON.stringify(scored) });
          }
          call.write({ kind: 'done', payload: JSON.stringify({ context: result.context }) });
          call.end();
        })
        .catch((error: unknown) => call.destroy(toGrpcError(error)));
    },
  } satisfies Record<string, unknown> as unknown as UntypedServiceImplementation;

  const health = {
    Check: (
      _call: ServerUnaryCall<{ service: string }, { status: string }>,
      callback: sendUnaryData<{ status: string }>,
    ): void => {
      callback(null, { status: 'SERVING' });
    },
  } satisfies Record<string, unknown> as unknown as UntypedServiceImplementation;

  return { memory, search, context, health };
}
