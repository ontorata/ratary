import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { ContextHandlers } from '../shared/handlers/context.handlers.js';
import { buildTransportContextFromRestRequest } from '../shared/resolve-transport-scope.js';
import { buildContextRequestFromQuery } from '../shared/streaming/stream-context-chunks.js';
import { SseStreamPublisher, writeSseHeaders } from './sse-stream-publisher.js';

export interface SseRouteDeps {
  handlers: ContextHandlers;
}

export async function registerSseRoutes(
  fastify: FastifyInstance,
  deps: SseRouteDeps,
): Promise<void> {
  fastify.get(
    '/context/stream',
    {
      schema: {
        tags: ['Memory Intelligence'],
        summary: 'Stream ranked memory context as Server-Sent Events (Phase 13)',
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
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
    },
  );
}
