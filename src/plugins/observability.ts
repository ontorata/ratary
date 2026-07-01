import type { FastifyInstance } from 'fastify';

export async function observabilityPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onResponse', async (request, reply) => {
    request.log.info(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime,
      },
      'request completed',
    );
  });
}
