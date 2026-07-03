import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { WorkspaceController } from '../../controllers/workspace.controller.js';
import { createWorkspaceBodySchema, registerAgentBodySchema } from '../../types/workspace.js';
import { ValidationError } from '../../types/errors.js';

function validateBody<T extends z.ZodType>(schema: T) {
  return async (request: { body: unknown }): Promise<void> => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten());
    }
    request.body = result.data;
  };
}

const workspaceIdParamsSchema = z.object({
  id: z.string().uuid(),
});

function validateParams<T extends z.ZodType>(schema: T) {
  return async (request: { params: unknown }): Promise<void> => {
    const result = schema.safeParse(request.params);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten());
    }
    request.params = result.data;
  };
}

export async function workspaceRoutes(
  fastify: FastifyInstance,
  controller: WorkspaceController,
): Promise<void> {
  fastify.get(
    '/workspaces',
    {
      schema: {
        tags: ['Multi-AI'],
        summary: 'List workspaces for the authenticated owner',
      },
    },
    controller.listWorkspaces.bind(controller),
  );

  fastify.post(
    '/workspaces',
    {
      preValidation: [validateBody(createWorkspaceBodySchema)],
      schema: {
        tags: ['Multi-AI'],
        summary: 'Create a workspace',
      },
    },
    controller.createWorkspace.bind(controller),
  );

  fastify.get(
    '/workspaces/:id/agents',
    {
      preValidation: [validateParams(workspaceIdParamsSchema)],
      schema: {
        tags: ['Multi-AI'],
        summary: 'List agents registered in a workspace',
      },
    },
    controller.listAgents.bind(controller),
  );

  fastify.post(
    '/workspaces/:id/agents',
    {
      preValidation: [
        validateParams(workspaceIdParamsSchema),
        validateBody(registerAgentBodySchema),
      ],
      schema: {
        tags: ['Multi-AI'],
        summary: 'Register an agent in a workspace',
      },
    },
    controller.registerAgent.bind(controller),
  );
}
