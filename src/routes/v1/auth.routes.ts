import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  bootstrapBodySchema,
  createClientBodySchema,
  createIdentityBodySchema,
  issueTokenBodySchema,
  updateClientBodySchema,
} from '../../auth/auth.types.js';
import type { AuthController } from '../../controllers/auth.controller.js';
import { AUTH_RATE_LIMITS, NATIVE_AUTH_RATE_LIMITS, registerAuthRateLimit } from '../../plugins/rate-limit.js';
import { requireHttpsForCredentialAuth } from '../../plugins/credential-auth-security.js';
import { ValidationError } from '../../types/errors.js';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const registerBodySchema = z.object({
  email: z.string().email().max(254),
  password: z
    .string()
    .min(8)
    .max(200)
    .regex(/[A-Za-z]/, 'Password must include a letter')
    .regex(/[0-9]/, 'Password must include a number'),
  display_name: z.string().min(1).max(120).optional(),
});

const loginBodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
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
  await registerAuthRateLimit(fastify);

  fastify.post(
    '/auth/bootstrap',
    {
      config: { rateLimit: AUTH_RATE_LIMITS.bootstrap },
      preValidation: [validateBody(bootstrapBodySchema)],
      schema: { tags: ['Auth'], summary: 'One-time bootstrap (only when no identities exist)' },
    },
    controller.bootstrap.bind(controller),
  );

  fastify.post(
    '/auth/identities',
    {
      config: { rateLimit: AUTH_RATE_LIMITS.identities },
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
      config: { rateLimit: AUTH_RATE_LIMITS.rotate },
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
    '/auth/token',
    {
      preValidation: [validateBody(issueTokenBodySchema)],
      schema: { tags: ['Auth'], summary: 'Issue short-lived JWT for current identity' },
    },
    controller.issueToken.bind(controller),
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

  if (controller.nativeAuthEnabled) {
    fastify.addHook('onRequest', requireHttpsForCredentialAuth);

    fastify.post(
      '/auth/register',
      {
        config: { rateLimit: NATIVE_AUTH_RATE_LIMITS.register },
        preValidation: [validateBody(registerBodySchema)],
        schema: {
          tags: ['Auth'],
          summary: 'Register native account (email/password) — dedicated owner scope',
        },
      },
      controller.register.bind(controller),
    );

    fastify.post(
      '/auth/login',
      {
        config: { rateLimit: NATIVE_AUTH_RATE_LIMITS.login },
        preValidation: [validateBody(loginBodySchema)],
        schema: { tags: ['Auth'], summary: 'Login native account' },
      },
      controller.login.bind(controller),
    );
  }
}
