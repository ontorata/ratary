import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import type { KnowledgeFabricPorts } from '../composition/create-knowledge-fabric-ports.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../types/errors.js';
import type { ConnectorId } from '../knowledge-fabric-platform/types/connector.types.js';
import { CONNECTOR_IDS } from '../knowledge-fabric-platform/types/connector.types.js';
import type { FabricIngestMode } from '../knowledge-fabric-platform/types/ingest.types.js';
import type { ExternalKnowledgeItem } from '../knowledge-fabric-platform/types/connector.types.js';
import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';
import { verifyWebhookSignature } from '../knowledge-fabric-platform/sync/webhook-signature.js';

function parseConnectorId(value: string): ConnectorId {
  if (!(CONNECTOR_IDS as readonly string[]).includes(value)) {
    throw new ValidationError(`connectorId must be one of: ${CONNECTOR_IDS.join(', ')}`);
  }
  return value as ConnectorId;
}

function parseWebhookItems(body: unknown): ExternalKnowledgeItem[] {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('Webhook body must be a JSON object');
  }
  const record = body as { items?: unknown };
  if (!Array.isArray(record.items) || record.items.length === 0) {
    throw new ValidationError('Webhook body must include a non-empty items array');
  }
  return record.items as ExternalKnowledgeItem[];
}

export function createKnowledgeFabricController(
  env: Env,
  ports: KnowledgeFabricPorts,
  scopeResolver: IScopeResolver,
  metricsExporter?: IMetricsExporter,
) {
  function assertEnabled(): void {
    if (!ports.enabled) {
      throw new ForbiddenError(
        'Knowledge fabric platform is disabled (KNOWLEDGE_FABRIC_ENABLED=false)',
      );
    }
  }

  function assertSyncEnabled(): void {
    assertEnabled();
    if (!ports.connectorSyncEnabled) {
      throw new ForbiddenError('Live connector sync is disabled (CONNECTOR_SYNC_ENABLED=false)');
    }
  }

  return {
    async getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      reply.send({
        enabled: ports.enabled,
        connectorSyncEnabled: ports.connectorSyncEnabled,
        catalogConfigured: Boolean(env.KNOWLEDGE_FABRIC_CATALOG_JSON.trim()),
      });
    },

    async getManifest(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      reply.send(await ports.manifestBuilder.build());
    },

    async listConnectors(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const connectors = ports.orchestrator.listConnectors();
      reply.send({ connectors, count: connectors.length });
    },

    async listIngestRuns(
      request: FastifyRequest<{ Querystring: { limit?: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const limit = request.query.limit ? Number(request.query.limit) : 20;
      const runs = await ports.orchestrator.listRuns(Number.isFinite(limit) ? limit : 20);
      reply.send({ runs, count: runs.length });
    },

    async getConnectorState(
      request: FastifyRequest<{ Params: { connectorId: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const connectorId = parseConnectorId(request.params.connectorId);
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const state = await ports.orchestrator.getConnectorState(connectorId, scope);
      reply.send({ connectorId, state });
    },

    async ingest(
      request: FastifyRequest<{
        Params: { connectorId: string };
        Body: { mode?: FabricIngestMode; dryRun?: boolean; limit?: number };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const connectorId = parseConnectorId(request.params.connectorId);
      const body = request.body ?? {};
      const mode = body.mode ?? 'full';
      if (mode !== 'full' && mode !== 'incremental') {
        throw new ValidationError('mode must be full or incremental');
      }

      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);

      try {
        const run = await ports.orchestrator.ingest(
          {
            connectorId,
            mode,
            dryRun: body.dryRun,
            limit: body.limit,
          },
          scope,
        );
        ports.recordIngestLifecycle(metricsExporter, connectorId, 'completed');
        reply.send(run);
      } catch (error) {
        ports.recordIngestLifecycle(metricsExporter, connectorId, 'failed');
        throw error;
      }
    },

    async enqueueSync(
      request: FastifyRequest<{
        Params: { connectorId: string };
        Body: { mode?: FabricIngestMode; dryRun?: boolean; limit?: number };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertSyncEnabled();
      if (!ports.syncJobRunner) {
        throw new ForbiddenError('Connector sync job runner is not available');
      }

      const connectorId = parseConnectorId(request.params.connectorId);
      const body = request.body ?? {};
      const mode = body.mode ?? 'incremental';
      if (mode !== 'full' && mode !== 'incremental') {
        throw new ValidationError('mode must be full or incremental');
      }

      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const jobId = ports.syncJobRunner.enqueue(
        {
          connectorId,
          mode,
          dryRun: body.dryRun,
          limit: body.limit,
        },
        scope,
      );

      reply.status(202).send({ jobId, status: 'queued' });
    },

    async getSyncJob(
      request: FastifyRequest<{ Params: { jobId: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertSyncEnabled();
      if (!ports.syncJobRunner) {
        throw new ForbiddenError('Connector sync job runner is not available');
      }

      const job = ports.syncJobRunner.getJob(request.params.jobId);
      if (!job) {
        throw new NotFoundError('ConnectorSyncJob', request.params.jobId);
      }

      if (job.run) {
        reply.send(job.run);
        return;
      }

      reply.send({
        id: job.id,
        status: job.status,
        errorMessage: job.errorMessage,
      });
    },

    async receiveWebhook(
      request: FastifyRequest<{
        Params: { connectorId: string };
        Body: unknown;
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertSyncEnabled();

      const secret = env.CONNECTOR_WEBHOOK_SECRET?.trim();
      if (!secret) {
        throw new ForbiddenError('CONNECTOR_WEBHOOK_SECRET is not configured');
      }

      const signature = request.headers['x-ratary-signature'];
      const rawBody = JSON.stringify(request.body ?? {});
      const sigHeader = Array.isArray(signature) ? signature[0] : signature;
      if (!verifyWebhookSignature(secret, rawBody, sigHeader)) {
        throw new ForbiddenError('Invalid webhook signature');
      }

      const connectorId = parseConnectorId(request.params.connectorId);
      const items = parseWebhookItems(request.body);
      const webhookConnector = ports.webhookConnectors.get(connectorId);
      if (!webhookConnector) {
        throw new ValidationError(`Unknown connector: ${connectorId}`);
      }

      webhookConnector.setPendingItems(items);
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);

      try {
        const run = await ports.orchestrator.ingest(
          { connectorId, mode: 'full', limit: items.length },
          scope,
          webhookConnector,
        );
        ports.recordIngestLifecycle(metricsExporter, connectorId, 'completed');
        reply.send(run);
      } catch (error) {
        ports.recordIngestLifecycle(metricsExporter, connectorId, 'failed');
        throw error;
      }
    },
  };
}

export type KnowledgeFabricController = ReturnType<typeof createKnowledgeFabricController>;
