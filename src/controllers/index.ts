import type { FastifyReply, FastifyRequest } from 'fastify';
import type { HealthService } from '../services/health.service.js';
import type { MemoryService } from '../services/memory.service.js';
import type { MemoryScope } from '../types/memory.js';
import {
  toBackupResponse,
  toMemoryListResponse,
  toMemoryResponse,
  toSearchResponse,
} from '../utils/memory-response.js';
import { createAuthController, AuthController } from './auth.controller.js';

export { createAuthController, AuthController };

function memoryScopeFromRequest(request: FastifyRequest): MemoryScope {
  return { ownerId: request.user?.ownerId ?? '' };
}

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
        auth_bootstrap: '/api/v1/auth/bootstrap',
        legacy_memory: '/memory',
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
  constructor(private readonly memoryService: MemoryService) {}

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const memory = await this.memoryService.createMemory(
      memoryScopeFromRequest(request),
      request.body as never,
    );
    reply.status(201).send(toMemoryResponse(memory));
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const memory = await this.memoryService.getMemoryById(
      memoryScopeFromRequest(request),
      request.params.id,
    );
    reply.send(toMemoryResponse(memory));
  }

  async getByCodename(
    request: FastifyRequest<{ Params: { codename: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const memory = await this.memoryService.getMemoryByCodename(
      memoryScopeFromRequest(request),
      request.params.codename,
    );
    reply.send(toMemoryResponse(memory));
  }

  async getBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const memory = await this.memoryService.getMemoryBySlug(
      memoryScopeFromRequest(request),
      request.params.slug,
    );
    reply.send(toMemoryResponse(memory));
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const memory = await this.memoryService.updateMemory(
      memoryScopeFromRequest(request),
      request.params.id,
      request.body as never,
    );
    reply.send(toMemoryResponse(memory));
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.memoryService.deleteMemory(memoryScopeFromRequest(request), request.params.id);
    reply.status(204).send();
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.memoryService.listMemories(
      memoryScopeFromRequest(request),
      request.query as never,
    );
    reply.send(toMemoryListResponse(result));
  }

  async search(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.memoryService.searchMemory(
      memoryScopeFromRequest(request),
      request.query as never,
    );
    reply.send(toSearchResponse(result));
  }

  async listProjects(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const projects = await this.memoryService.listProjects(memoryScopeFromRequest(request));
    reply.send({ projects });
  }

  async listTags(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const tags = await this.memoryService.listTags(memoryScopeFromRequest(request));
    reply.send({ tags });
  }

  async toggleFavorite(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const memory = await this.memoryService.toggleFavorite(
      memoryScopeFromRequest(request),
      request.params.id,
    );
    reply.send(toMemoryResponse(memory));
  }

  async archive(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const memory = await this.memoryService.archiveMemory(
      memoryScopeFromRequest(request),
      request.params.id,
      true,
    );
    reply.send(toMemoryResponse(memory));
  }
}

export function createMemoryController(memoryService: MemoryService): MemoryController {
  return new MemoryController(memoryService);
}

export class BackupController {
  constructor(private readonly memoryService: MemoryService) {}

  async export(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const backup = await this.memoryService.exportBackup(memoryScopeFromRequest(request));
    reply.send(toBackupResponse(backup));
  }

  async import(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const replace = (request.query as { replace?: string }).replace === 'true';
    const scope = memoryScopeFromRequest(request);
    const result = replace
      ? await this.memoryService.replaceBackup(scope, request.body as never)
      : await this.memoryService.importBackup(scope, request.body as never);
    reply.send(result);
  }
}

export function createBackupController(memoryService: MemoryService): BackupController {
  return new BackupController(memoryService);
}
