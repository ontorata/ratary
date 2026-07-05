import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import { buildTransportContextFromRestRequest } from '../transport/shared/resolve-transport-scope.js';
import {
  createCapabilitiesHandlers,
  type CapabilitiesHandlers,
} from '../transport/shared/handlers/create-transport-handlers.js';

export function createCapabilitiesController(env: Env, handlers?: CapabilitiesHandlers) {
  const resolved = handlers ?? createCapabilitiesHandlers({ env });

  return {
    async getManifest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const ctx = buildTransportContextFromRestRequest(request);
      const openApiUrl = `${request.protocol}://${request.hostname}/docs/json`;
      const manifest = await resolved.getManifest.handle(ctx, { openApiUrl });
      reply.header('X-Protocol-Version', manifest.protocolVersion);
      reply.send(manifest);
    },
    async negotiate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const ctx = buildTransportContextFromRestRequest(request);
      const body = (request.body ?? {}) as Record<string, unknown>;
      const openApiUrl = `${request.protocol}://${request.hostname}/docs/json`;
      const result = await resolved.negotiate.handle(ctx, {
        openApiUrl,
        capabilitiesUrl: '/api/v1/capabilities',
        negotiateUrl: '/api/v1/capabilities/negotiate',
        ...(typeof body.protocolVersion === 'string'
          ? { protocolVersion: body.protocolVersion }
          : {}),
        ...(body.clientInfo &&
        typeof body.clientInfo === 'object' &&
        !Array.isArray(body.clientInfo) &&
        typeof (body.clientInfo as Record<string, unknown>).name === 'string' &&
        typeof (body.clientInfo as Record<string, unknown>).version === 'string'
          ? {
              clientInfo: {
                name: (body.clientInfo as Record<string, string>).name,
                version: (body.clientInfo as Record<string, string>).version,
              },
            }
          : {}),
        ...(Array.isArray(body.requiredCapabilities)
          ? {
              requiredCapabilities: body.requiredCapabilities.filter(
                (item): item is string => typeof item === 'string',
              ),
            }
          : {}),
        ...(Array.isArray(body.preferredCapabilities)
          ? {
              preferredCapabilities: body.preferredCapabilities.filter(
                (item): item is string => typeof item === 'string',
              ),
            }
          : {}),
        ...(Array.isArray(body.transports)
          ? {
              transports: body.transports.filter(
                (item): item is string => typeof item === 'string',
              ),
            }
          : {}),
      });
      reply.header('X-Protocol-Version', result.negotiatedProtocolVersion);
      reply.send(result);
    },
  };
}

export type CapabilitiesController = ReturnType<typeof createCapabilitiesController>;
