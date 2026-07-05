import type { FastifyInstance } from 'fastify';

import type { SearchGraphController } from '../../controllers/search-graph.controller.js';

export async function searchGraphRoutes(
  fastify: FastifyInstance,

  controller: SearchGraphController,
): Promise<void> {
  fastify.get(
    '/search-graph/status',

    {
      schema: {
        tags: ['Search & Graph Production'],

        summary: 'Search & graph production platform status (Phase 21)',
      },
    },

    controller.getStatus.bind(controller),
  );

  fastify.get(
    '/search-graph/manifest',

    {
      schema: {
        tags: ['Search & Graph Production'],

        summary: 'Search & graph platform manifest',
      },
    },

    controller.getManifest.bind(controller),
  );

  fastify.get(
    '/search-graph/sync/runs',

    {
      schema: {
        tags: ['Search & Graph Production'],

        summary: 'List recent search/graph sync runs',
      },
    },

    controller.listSyncRuns.bind(controller),
  );

  fastify.get(
    '/search-graph/sync/state/:target',

    {
      schema: {
        tags: ['Search & Graph Production'],

        summary: 'Get sync watermark state for meilisearch or neo4j',
      },
    },

    controller.getSyncState.bind(controller),
  );

  fastify.post(
    '/search-graph/sync/search',

    {
      schema: {
        tags: ['Search & Graph Production'],

        summary: 'Run Meilisearch index sync (full or incremental)',
      },
    },

    controller.syncSearch.bind(controller),
  );

  fastify.post(
    '/search-graph/sync/graph',

    {
      schema: {
        tags: ['Search & Graph Production'],

        summary: 'Run Neo4j graph sync (full or incremental)',
      },
    },

    controller.syncGraph.bind(controller),
  );
}
