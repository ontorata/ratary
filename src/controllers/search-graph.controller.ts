import type { FastifyReply, FastifyRequest } from 'fastify';

import type { Env } from '../config/env.js';

import type { SearchGraphPorts } from '../composition/create-search-graph-ports.js';

import { ForbiddenError, ValidationError } from '../types/errors.js';

import type { SearchGraphSyncMode } from '../search-graph-platform/types/sync.types.js';

import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';

export function createSearchGraphController(
  env: Env,

  ports: SearchGraphPorts,

  metricsExporter?: IMetricsExporter,
) {
  function assertEnabled(): void {
    if (!ports.enabled) {
      throw new ForbiddenError(
        'Search graph platform is disabled (SEARCH_GRAPH_PLATFORM_ENABLED=false)',
      );
    }
  }

  return {
    async getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      reply.send({
        enabled: ports.enabled,

        searchProvider: env.SEARCH_PROVIDER,

        graphProvider: env.GRAPH_PROVIDER,

        graphVectorSeedsEnabled: env.GRAPH_VECTOR_SEEDS_ENABLED,
      });
    },

    async getManifest(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();

      reply.send(await ports.manifestBuilder.build());
    },

    async listSyncRuns(
      request: FastifyRequest<{ Querystring: { limit?: string } }>,

      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();

      const limit = request.query.limit ? Number(request.query.limit) : 20;

      const runs = await ports.orchestrator.listRuns(Number.isFinite(limit) ? limit : 20);

      reply.send({ runs, count: runs.length });
    },

    async getSyncState(
      request: FastifyRequest<{ Params: { target: 'meilisearch' | 'neo4j' } }>,

      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();

      const target = request.params.target;

      if (target !== 'meilisearch' && target !== 'neo4j') {
        throw new ValidationError('target must be meilisearch or neo4j');
      }

      const state = await ports.orchestrator.getSyncState(target);

      reply.send({ target, state });
    },

    async syncSearch(
      request: FastifyRequest<{
        Body: {
          mode?: SearchGraphSyncMode;
          ownerId?: string;
          dryRun?: boolean;
          batchSize?: number;
        };
      }>,

      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();

      const body = request.body ?? {};

      const mode = body.mode ?? 'full';

      if (mode !== 'full' && mode !== 'incremental') {
        throw new ValidationError('mode must be full or incremental');
      }

      try {
        const run = await ports.orchestrator.syncSearch({
          mode,

          ownerId: body.ownerId?.trim(),

          dryRun: body.dryRun,

          batchSize: body.batchSize,
        });

        ports.recordSyncLifecycle(metricsExporter, 'meilisearch', 'completed');

        reply.send(run);
      } catch (error) {
        ports.recordSyncLifecycle(metricsExporter, 'meilisearch', 'failed');

        throw error;
      }
    },

    async syncGraph(
      request: FastifyRequest<{
        Body: {
          mode?: SearchGraphSyncMode;
          ownerId?: string;
          dryRun?: boolean;
          batchSize?: number;
        };
      }>,

      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();

      const body = request.body ?? {};

      const mode = body.mode ?? 'full';

      if (mode !== 'full' && mode !== 'incremental') {
        throw new ValidationError('mode must be full or incremental');
      }

      try {
        const run = await ports.orchestrator.syncGraph({
          mode,

          ownerId: body.ownerId?.trim(),

          dryRun: body.dryRun,

          batchSize: body.batchSize,
        });

        ports.recordSyncLifecycle(metricsExporter, 'neo4j', 'completed');

        reply.send(run);
      } catch (error) {
        ports.recordSyncLifecycle(metricsExporter, 'neo4j', 'failed');

        throw error;
      }
    },
  };
}

export type SearchGraphController = ReturnType<typeof createSearchGraphController>;
