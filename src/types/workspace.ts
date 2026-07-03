import { z } from 'zod';
import { AGENT_TYPES } from '../agent/agent.types.js';

export const createWorkspaceBodySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
});

export type CreateWorkspaceBody = z.infer<typeof createWorkspaceBodySchema>;

export const registerAgentBodySchema = z.object({
  name: z.string().min(1).max(200),
  agentType: z.enum(AGENT_TYPES).optional(),
  clientId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type RegisterAgentBody = z.infer<typeof registerAgentBodySchema>;
