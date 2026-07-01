import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  bootstrapBodySchema,
  createClientBodySchema,
  createIdentityBodySchema,
  updateClientBodySchema,
} from '../../auth/auth.types.js';
import type { AuthController } from '../../controllers/auth.controller.js';
import { ValidationError } from '../../types/errors.js';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

function validateBody<T extends z.ZodType>(schema: T) {
  return async (request: { body: unknown }): Promise<void> => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten());
    }
    request.body = result.data;
  };
}

function validateParams<T extends z.ZodType>(schema: T) {
  return async (request: { params: unknown }): Promise<void> => {
    const result = schema.safeParse(request.params);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten());
    }
    request.params = result.data;
  };
}

export async function authRoutes(
  fastify: FastifyInstance,
  controller: AuthController,
): Promise<void> {
  fastify.post(
    '/auth/bootstrap',
    {
      preValidation: [validateBody(bootstrapBodySchema)],
      schema: { tags: ['Auth'], summary: 'One-time bootstrap (only when no identities exist)' },
    },
    controller.bootstrap.bind(controller),
  );

  fastify.post(
    '/auth/identities',
    {
      preValidation: [validateBody(createIdentityBodySchema)],
      schema: { tags: ['Auth'], summary: 'Create API key identity' },
    },
    controller.createIdentity.bind(controller),
  );

  fastify.get(
    '/auth/identities',
    {
      schema: { tags: ['Auth'], summary: 'List identities for current owner' },
    },
    controller.listIdentities.bind(controller),
  );

  fastify.delete(
    '/auth/identities/:id',
    {
      preValidation: [validateParams(idParamSchema)],
      schema: { tags: ['Auth'], summary: 'Revoke identity (soft delete)' },
    },
    controller.revokeIdentity.bind(controller),
  );

  fastify.post(
    '/auth/identities/:id/rotate',
    {
      preValidation: [validateParams(idParamSchema)],
      schema: { tags: ['Auth'], summary: 'Rotate API key secret' },
    },
    controller.rotateIdentity.bind(controller),
  );

  fastify.post(
    '/auth/verify',
    {
      schema: { tags: ['Auth'], summary: 'Verify current credentials' },
    },
    controller.verify.bind(controller),
  );

  fastify.post(
    '/auth/clients',
    {
      preValidation: [validateBody(createClientBodySchema)],
      schema: { tags: ['Auth'], summary: 'Register a client application' },
    },
    controller.createClient.bind(controller),
  );

  fastify.get(
    '/auth/clients',
    {
      schema: { tags: ['Auth'], summary: 'List clients for current owner' },
    },
    controller.listClients.bind(controller),
  );

  fastify.get(
    '/auth/clients/:id',
    {
      preValidation: [validateParams(idParamSchema)],
      schema: { tags: ['Auth'], summary: 'Get client by ID' },
    },
    controller.getClient.bind(controller),
  );

  fastify.patch(
    '/auth/clients/:id',
    {
      preValidation: [validateParams(idParamSchema), validateBody(updateClientBodySchema)],
      schema: { tags: ['Auth'], summary: 'Update client (e.g. deactivate)' },
    },
    controller.updateClient.bind(controller),
  );
}
