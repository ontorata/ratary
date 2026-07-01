import type { ClientRepository } from './client.repository.js';
import { emitAuthEvent } from './events.js';
import { ForbiddenError, NotFoundError } from '../types/errors.js';
import type { Client, CreateClientBody, UpdateClientBody } from './auth.types.js';

export class ClientService {
  constructor(private readonly clientRepository: ClientRepository) {}

  async create(input: CreateClientBody, ownerId: string): Promise<Client> {
    const client = await this.clientRepository.insert({
      name: input.name,
      type: input.type,
      description: input.description,
      metadata: input.metadata,
      ownerId,
    });

    emitAuthEvent({
      event: 'client.created',
      ownerId,
      clientId: client.id,
      metadata: { name: client.name, type: client.type },
    });

    return client;
  }

  async list(ownerId: string): Promise<Client[]> {
    return this.clientRepository.listByOwner(ownerId);
  }

  async getById(id: string, ownerId: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) throw new NotFoundError('Client', id);
    if (client.ownerId !== ownerId) {
      throw new ForbiddenError('Cannot access client owned by another user');
    }
    return client;
  }

  async update(id: string, input: UpdateClientBody, ownerId: string): Promise<Client> {
    const existing = await this.getById(id, ownerId);
    const updated = await this.clientRepository.update(id, ownerId, {
      name: input.name ?? existing.name,
      type: input.type ?? existing.type,
      description: input.description ?? existing.description,
      metadata: input.metadata ?? existing.metadata,
      active: input.active ?? existing.active,
    });
    if (!updated) throw new NotFoundError('Client', id);

    if (input.active === false && existing.active) {
      emitAuthEvent({
        event: 'client.deactivated',
        ownerId,
        clientId: id,
      });
    }

    return updated;
  }
}
