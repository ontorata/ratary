import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import type { ContentScalePorts } from '../composition/create-content-scale-ports.js';
import { ForbiddenError, ValidationError } from '../types/errors.js';
import type { ContentScaleSyncMode } from '../content-scale-platform/types/sync.types.js';
import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';

export function createContentScaleController(
  env: Env,
  ports: ContentScalePorts,
  metricsExporter?: IMetricsExporter,
) {
  function assertEnabled(): void {
    if (!ports.enabled) {
      throw new ForbiddenError(
        'Content scale platform is disabled (CONTENT_SCALE_PLATFORM_ENABLED=false)',
      );
    }
  }

  return {
    async getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      reply.send({
        enabled: ports.enabled,
        objectStorageProvider: env.OBJECT_STORAGE_PROVIDER,
        vectorProvider: env.VECTOR_PROVIDER,
        embeddingProvider: env.EMBEDDING_PROVIDER,
        contentOffloadMinBytes: env.CONTENT_OFFLOAD_MIN_BYTES,
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
      request: FastifyRequest<{ Params: { target: 'content' | 'pgvector' | 'embedding' } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const target = request.params.target;
      if (target !== 'content' && target !== 'pgvector' && target !== 'embedding') {
        throw new ValidationError('target must be content, pgvector, or embedding');
      }
      const state = await ports.orchestrator.getSyncState(target);
      reply.send({ target, state });
    },

    async syncContent(
      request: FastifyRequest<{
        Body: {
          mode?: ContentScaleSyncMode;
          ownerId?: string;
          dryRun?: boolean;
          batchSize?: number;
          clearInline?: boolean;
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
        const run = await ports.orchestrator.syncContent({
          mode,
          ownerId: body.ownerId?.trim(),
          dryRun: body.dryRun,
          batchSize: body.batchSize,
          clearInline: body.clearInline,
        });
        ports.recordSyncLifecycle(metricsExporter, 'content', 'completed');
        reply.send(run);
      } catch (error) {
        ports.recordSyncLifecycle(metricsExporter, 'content', 'failed');
        throw error;
      }
    },

    async syncPgvector(
      request: FastifyRequest<{
        Body: {
          mode?: ContentScaleSyncMode;
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
        const run = await ports.orchestrator.syncPgvector({
          mode,
          ownerId: body.ownerId?.trim(),
          dryRun: body.dryRun,
          batchSize: body.batchSize,
        });
        ports.recordSyncLifecycle(metricsExporter, 'pgvector', 'completed');
        reply.send(run);
      } catch (error) {
        ports.recordSyncLifecycle(metricsExporter, 'pgvector', 'failed');
        throw error;
      }
    },

    async syncEmbeddings(
      request: FastifyRequest<{
        Body: {
          mode?: ContentScaleSyncMode;
          ownerId?: string;
          dryRun?: boolean;
          batchSize?: number;
          forceReembed?: boolean;
          projectId?: string;
        };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const body = request.body ?? {};

      try {
        const run = await ports.orchestrator.syncEmbeddings({
          mode: body.mode ?? 'full',
          ownerId: body.ownerId?.trim(),
          dryRun: body.dryRun,
          batchSize: body.batchSize,
          forceReembed: body.forceReembed,
          projectId: body.projectId?.trim(),
        });
        ports.recordSyncLifecycle(metricsExporter, 'embedding', 'completed');
        reply.send(run);
      } catch (error) {
        ports.recordSyncLifecycle(metricsExporter, 'embedding', 'failed');
        throw error;
      }
    },
  };
}

export type ContentScaleController = ReturnType<typeof createContentScaleController>;
