import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import type { KnowledgeFabricPorts } from '../composition/create-knowledge-fabric-ports.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';
import { ForbiddenError, ValidationError } from '../types/errors.js';
import type { ConnectorId } from '../knowledge-fabric-platform/types/connector.types.js';
import { CONNECTOR_IDS } from '../knowledge-fabric-platform/types/connector.types.js';
import type { FabricIngestMode } from '../knowledge-fabric-platform/types/ingest.types.js';
import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';

function parseConnectorId(value: string): ConnectorId {
  if (!(CONNECTOR_IDS as readonly string[]).includes(value)) {
    throw new ValidationError(`connectorId must be one of: ${CONNECTOR_IDS.join(', ')}`);
  }
  return value as ConnectorId;
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

  return {
    async getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      reply.send({
        enabled: ports.enabled,
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
  };
}

export type KnowledgeFabricController = ReturnType<typeof createKnowledgeFabricController>;
