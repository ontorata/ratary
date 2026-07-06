import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function swaggerPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Ratary API',
        description:
          'Second brain for AI coding assistants. Store, search, and access coding knowledge across devices.',
        version: '1.1.0',
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Local development' },
        { url: 'https://ratary.ontorata.com', description: 'Production' },
      ],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Auth', description: 'Identity, API keys, clients, bootstrap' },
        { name: 'Memory', description: 'Memory CRUD operations' },
        { name: 'Knowledge', description: 'Categories, memory types, relations' },
        { name: 'Search', description: 'Search operations with relevance ranking' },
        { name: 'Backup', description: 'Backup and restore' },
        { name: 'Capabilities', description: 'Runtime capability discovery (Phase 7.5)' },
        { name: 'Signals', description: 'Memory quality signal ingest (Phase 8.5)' },
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'API key with aic_ prefix from bootstrap or POST /auth/identities',
          },
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            description: 'Bearer aic_... (same as X-API-Key)',
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
