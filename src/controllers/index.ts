import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MemoryService } from '../services/memory.service.js';
import type { MemoryScope } from '../types/memory.js';
import { createAuthController, AuthController } from './auth.controller.js';

export { createAuthController, AuthController };

function memoryScopeFromRequest(request: FastifyRequest): MemoryScope {
  return { ownerId: request.user?.ownerId ?? '' };
}

export class HealthController {
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
    reply.send({
      status: 'ok',
      service: 'ai-memory-cloud',
      timestamp: new Date().toISOString(),
    });
  }
}

export function createHealthController(): HealthController {
  return new HealthController();
}

export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const memory = await this.memoryService.createMemory(
      memoryScopeFromRequest(request),
      request.body as never,
    );
    reply.status(201).send(memory);
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const memory = await this.memoryService.getMemoryById(
      memoryScopeFromRequest(request),
      request.params.id,
    );
    reply.send(memory);
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
    reply.send(memory);
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.memoryService.deleteMemory(
      memoryScopeFromRequest(request),
      request.params.id,
    );
    reply.status(204).send();
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.memoryService.listMemories(
      memoryScopeFromRequest(request),
      request.query as never,
    );
    reply.send(result);
  }

  async search(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.memoryService.searchMemory(
      memoryScopeFromRequest(request),
      request.query as never,
    );
    reply.send(result);
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
    reply.send(memory);
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
    reply.send(memory);
  }
}

export function createMemoryController(memoryService: MemoryService): MemoryController {
  return new MemoryController(memoryService);
}

export class BackupController {
  constructor(private readonly memoryService: MemoryService) {}

  async export(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const backup = await this.memoryService.exportBackup(memoryScopeFromRequest(request));
    reply.send(backup);
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
