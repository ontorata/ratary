import type { FastifyReply, FastifyRequest } from 'fastify';
import type { HealthService } from '../services/health.service.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import type { MemoryService } from '../services/memory.service.js';
import {
  buildTransportContextFromRestRequest,
} from '../transport/shared/resolve-transport-scope.js';
import {
  createMemoryHandlers,
  type MemoryHandlers,
} from '../transport/shared/handlers/create-transport-handlers.js';
import {
  toBackupResponse,
  toMemoryListResponse,
  toMemoryResponse,
  toSearchResponse,
} from '../utils/memory-response.js';
import { createAuthController, AuthController } from './auth.controller.js';

export { createAuthController, AuthController };

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  async root(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.send({
      service: 'ai-memory-cloud',
      status: 'ok',
      endpoints: {
        health: '/health',
        api_v1: '/api/v1',
        memory: '/api/v1/memory',
        search: '/api/v1/search',
        projects: '/api/v1/projects',
        tags: '/api/v1/tags',
        backup: '/api/v1/backup/export',
        graph_capabilities: '/api/v1/graph/capabilities',
        graph_traverse: '/api/v1/graph/traverse',
        workspaces: '/api/v1/workspaces',
        auth_bootstrap: '/api/v1/auth/bootstrap',
      },
    });
  }

  async check(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const status = await this.healthService.check();
    const code = status.status === 'ok' ? 200 : 503;
    reply.status(code).send(status);
  }
}

export function createHealthController(healthService: HealthService): HealthController {
  return new HealthController(healthService);
}

export class MemoryController {
  constructor(private readonly handlers: MemoryHandlers) {}

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const memory = await this.handlers.create.handle(ctx, request.body as never);
    reply.status(201).send(toMemoryResponse(memory));
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const memory = await this.handlers.getById.handle(ctx, { id: request.params.id });
    reply.send(toMemoryResponse(memory));
  }

  async getByCodename(
    request: FastifyRequest<{ Params: { codename: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const memory = await this.handlers.getByCodename.handle(ctx, {
      codename: request.params.codename,
    });
    reply.send(toMemoryResponse(memory));
  }

  async getBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const memory = await this.handlers.getBySlug.handle(ctx, { slug: request.params.slug });
    reply.send(toMemoryResponse(memory));
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const memory = await this.handlers.update.handle(ctx, {
      id: request.params.id,
      input: request.body as never,
    });
    reply.send(toMemoryResponse(memory));
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    await this.handlers.delete.handle(ctx, { id: request.params.id });
    reply.status(204).send();
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const result = await this.handlers.list.handle(ctx, request.query as never);
    reply.send(toMemoryListResponse(result));
  }

  async search(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const result = await this.handlers.search.handle(ctx, request.query as never);
    reply.send(toSearchResponse(result));
  }

  async listProjects(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const projects = await this.handlers.listProjects.handle(ctx, {});
    reply.send({ projects });
  }

  async listTags(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const tags = await this.handlers.listTags.handle(ctx, {});
    reply.send({ tags });
  }

  async toggleFavorite(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const memory = await this.handlers.toggleFavorite.handle(ctx, { id: request.params.id });
    reply.send(toMemoryResponse(memory));
  }

  async archive(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const memory = await this.handlers.archive.handle(ctx, { id: request.params.id });
    reply.send(toMemoryResponse(memory));
  }
}

export function createMemoryController(
  memoryService: MemoryService,
  scopeResolver: IScopeResolver,
  handlers?: MemoryHandlers,
): MemoryController {
  return new MemoryController(
    handlers ?? createMemoryHandlers({ memoryService, scopeResolver }),
  );
}

export class BackupController {
  constructor(private readonly handlers: MemoryHandlers) {}

  async export(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ctx = buildTransportContextFromRestRequest(request);
    const backup = await this.handlers.exportBackup.handle(ctx, {});
    reply.send(toBackupResponse(backup));
  }

  async import(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const replace = (request.query as { replace?: string }).replace === 'true';
    const ctx = buildTransportContextFromRestRequest(request);
    const result = replace
      ? await this.handlers.replaceBackup.handle(ctx, { input: request.body as never })
      : await this.handlers.importBackup.handle(ctx, { input: request.body as never });
    reply.send(result);
  }
}

export function createBackupController(
  memoryService: MemoryService,
  scopeResolver: IScopeResolver,
  handlers?: MemoryHandlers,
): BackupController {
  return new BackupController(
    handlers ?? createMemoryHandlers({ memoryService, scopeResolver }),
  );
}
