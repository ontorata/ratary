import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getEnv } from '../../config/index.js';
import { registerPerIpRateLimit } from '../../plugins/rate-limit.js';
import type { ContextHandlers } from '../shared/handlers/context.handlers.js';
import { buildTransportContextFromRestRequest } from '../shared/resolve-transport-scope.js';
import { buildContextRequestFromQuery } from '../shared/streaming/stream-context-chunks.js';
import { SseConnectionGuard } from './sse-connection-guard.js';
import { SseStreamPublisher, writeSseHeaders } from './sse-stream-publisher.js';

export interface SseRouteDeps {
  handlers: ContextHandlers;
}

export async function registerSseRoutes(
  fastify: FastifyInstance,
  deps: SseRouteDeps,
): Promise<void> {
  const env = getEnv();
  await registerPerIpRateLimit(fastify);
  const connectionGuard = new SseConnectionGuard(env.SSE_MAX_CONCURRENT_PER_IP);

  fastify.get(
    '/context/stream',
    {
      config: {
        rateLimit: {
          max: env.SSE_STREAM_RATE_LIMIT_MAX,
          timeWindow: env.SSE_STREAM_RATE_LIMIT_WINDOW,
        },
      },
      schema: {
        tags: ['Memory Intelligence'],
        summary: 'Stream ranked memory context as Server-Sent Events (Phase 13)',
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const clientKey = request.ip;
      if (!connectionGuard.tryAcquire(clientKey)) {
        return reply.code(429).send({
          error: 'Too Many Requests',
          code: 'SSE_CONNECTION_LIMIT',
          message: `Maximum ${env.SSE_MAX_CONCURRENT_PER_IP} concurrent SSE streams per client IP`,
        });
      }

      let released = false;
      const releaseSlot = (): void => {
        if (released) return;
        released = true;
        connectionGuard.release(clientKey);
      };

      request.raw.on('close', releaseSlot);

      try {
        const ctx = buildTransportContextFromRestRequest(request);
        const query = request.query as Record<string, unknown>;
        const publisher = new SseStreamPublisher(reply.raw);
        writeSseHeaders(reply.raw);

        request.raw.on('close', () => {
          void publisher.close('client disconnected');
        });

        await deps.handlers.streamContext.handle(ctx, {
          ...buildContextRequestFromQuery(query),
          publisher,
        });
      } finally {
        releaseSlot();
      }
    },
  );
}
