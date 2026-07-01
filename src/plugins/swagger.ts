import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function swaggerPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'AI Memory Cloud API',
        description:
          'Second brain for AI coding assistants. Store, search, and access coding knowledge across devices.',
        version: '1.0.0',
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Local development' },
        { url: 'https://your-app.vercel.app', description: 'Production' },
      ],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Memory', description: 'Memory CRUD operations' },
        { name: 'Search', description: 'Search operations' },
        { name: 'Backup', description: 'Backup and restore' },
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
          },
        },
      },
      security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
}
