import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MemoryService } from '../services/memory.service.js';

export class HealthController {
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
    const memory = await this.memoryService.createMemory(request.body as never);
    reply.status(201).send(memory);
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const memory = await this.memoryService.getMemoryById(request.params.id);
    reply.send(memory);
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const memory = await this.memoryService.updateMemory(
      request.params.id,
      request.body as never,
    );
    reply.send(memory);
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.memoryService.deleteMemory(request.params.id);
    reply.status(204).send();
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.memoryService.listMemories(request.query as never);
    reply.send(result);
  }

  async search(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.memoryService.searchMemory(request.query as never);
    reply.send(result);
  }

  async listProjects(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const projects = await this.memoryService.listProjects();
    reply.send({ projects });
  }

  async listTags(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const tags = await this.memoryService.listTags();
    reply.send({ tags });
  }

  async toggleFavorite(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const memory = await this.memoryService.toggleFavorite(request.params.id);
    reply.send(memory);
  }

  async archive(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const memory = await this.memoryService.archiveMemory(request.params.id, true);
    reply.send(memory);
  }
}

export function createMemoryController(memoryService: MemoryService): MemoryController {
  return new MemoryController(memoryService);
}

export class BackupController {
  constructor(private readonly memoryService: MemoryService) {}

  async export(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const backup = await this.memoryService.exportBackup();
    reply.send(backup);
  }

  async import(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const replace = (request.query as { replace?: string }).replace === 'true';
    const result = replace
      ? await this.memoryService.replaceBackup(request.body as never)
      : await this.memoryService.importBackup(request.body as never);
    reply.send(result);
  }
}

export function createBackupController(memoryService: MemoryService): BackupController {
  return new BackupController(memoryService);
}
