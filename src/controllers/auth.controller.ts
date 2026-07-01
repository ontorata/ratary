import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IdentityService } from '../auth/identity.service.js';
import type { ClientService } from '../auth/client.service.js';
import type {
  BootstrapBody,
  CreateClientBody,
  CreateIdentityBody,
  UpdateClientBody,
} from '../auth/auth.types.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../types/errors.js';

function toPublicIdentity(identity: import('../auth/auth.types.js').Identity) {
  return {
    id: identity.id,
    type: identity.type,
    name: identity.name,
    owner_id: identity.ownerId,
    description: identity.description,
    metadata: identity.metadata,
    client_id: identity.clientId,
    created_by: identity.createdBy,
    created_at: identity.createdAt,
    last_used_at: identity.lastUsedAt,
    expires_at: identity.expiresAt,
    revoked_at: identity.revokedAt,
    active: identity.active,
  };
}

function toPublicClient(client: import('../auth/auth.types.js').Client) {
  return {
    id: client.id,
    name: client.name,
    type: client.type,
    description: client.description,
    metadata: client.metadata,
    owner_id: client.ownerId,
    created_at: client.createdAt,
    active: client.active,
  };
}

export class AuthController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly clientService: ClientService,
  ) {}

  async bootstrap(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const body = request.body as BootstrapBody;
      const result = await this.identityService.bootstrap(body);
      sendSuccess(
        reply,
        {
          apiKey: result.apiKey,
          identity: toPublicIdentity(result.identity),
          owner_id: result.ownerId,
          client_id: result.clientId,
        },
        201,
      );
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async createIdentity(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const user = request.user!;
      const body = request.body as CreateIdentityBody;
      const result = await this.identityService.create(body, {
        identityId: user.identityId,
        ownerId: user.ownerId,
      });
      sendSuccess(
        reply,
        {
          apiKey: result.apiKey,
          identity: toPublicIdentity(result.identity),
        },
        201,
      );
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async listIdentities(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const user = request.user!;
      const identities = await this.identityService.list(user.ownerId);
      sendSuccess(
        reply,
        identities.map(toPublicIdentity),
      );
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async revokeIdentity(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const user = request.user!;
      const { id } = request.params as { id: string };
      const identity = await this.identityService.revoke(id, user.ownerId);
      sendSuccess(reply, { revoked: true, identity: toPublicIdentity(identity) });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async rotateIdentity(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const user = request.user!;
      const { id } = request.params as { id: string };
      const result = await this.identityService.rotate(id, user.ownerId);
      sendSuccess(reply, {
        apiKey: result.apiKey,
        identity: toPublicIdentity(result.identity),
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async verify(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const user = request.user!;
      sendSuccess(reply, {
        authenticated: true,
        owner_id: user.ownerId,
        identity_id: user.identityId,
        identity_type: user.identityType,
        client_id: user.clientId,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async createClient(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const user = request.user!;
      const body = request.body as CreateClientBody;
      const client = await this.clientService.create(body, user.ownerId);
      sendSuccess(reply, { client: toPublicClient(client) }, 201);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async listClients(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const user = request.user!;
      const clients = await this.clientService.list(user.ownerId);
      sendSuccess(reply, clients.map(toPublicClient));
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getClient(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const user = request.user!;
      const { id } = request.params as { id: string };
      const client = await this.clientService.getById(id, user.ownerId);
      sendSuccess(reply, { client: toPublicClient(client) });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async updateClient(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const user = request.user!;
      const { id } = request.params as { id: string };
      const body = request.body as UpdateClientBody;
      const client = await this.clientService.update(id, body, user.ownerId);
      sendSuccess(reply, { client: toPublicClient(client) });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  private handleError(error: unknown, reply: FastifyReply): void {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    reply.status(500).send({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  }
}

export function createAuthController(
  identityService: IdentityService,
  clientService: ClientService,
): AuthController {
  return new AuthController(identityService, clientService);
}
