import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import type { InfrastructurePlatformPorts } from '../composition/create-infrastructure-platform-ports.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../types/errors.js';
import { findCatalogPlugin } from '../infrastructure-platform/catalog/provider-plugin-catalog.js';
import type { PluginManifest } from '../infrastructure-platform/types/plugin.types.js';
import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';

export function createInfrastructureController(
  env: Env,
  ports: InfrastructurePlatformPorts,
  metricsExporter?: IMetricsExporter,
) {
  function assertEnabled(): void {
    if (!ports.enabled) {
      throw new ForbiddenError('Plugin marketplace is disabled (PLUGIN_MARKETPLACE_ENABLED=false)');
    }
  }

  async function assertAllowList(
    organizationId: string | undefined,
    pluginId: string,
  ): Promise<void> {
    if (!organizationId) return;
    const allowed = await ports.allowList.isAllowed(organizationId, pluginId);
    if (!allowed) {
      throw new ForbiddenError(`Plugin ${pluginId} is not on tenant allow-list`);
    }
  }

  return {
    async getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      reply.send({
        enabled: ports.enabled,
        signatureRequired: env.PLUGIN_SIGNATURE_REQUIRED,
        federationCatalogSync: env.PLUGIN_FEDERATION_CATALOG_SYNC,
        marketplaceSource: env.PLUGIN_MARKETPLACE_SOURCE,
      });
    },

    async getInfrastructureManifest(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const infrastructure = await ports.manifestBuilder.build();
      reply.send(infrastructure);
    },

    async listMarketplace(
      request: FastifyRequest<{ Querystring: { q?: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const q = request.query.q?.trim();
      const entries = q ? await ports.marketplace.search(q) : (await ports.marketplace.getCatalog()).entries;
      reply.send({ entries, count: entries.length });
    },

    async getMarketplaceEntry(
      request: FastifyRequest<{ Params: { pluginId: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const entry = await ports.marketplace.getEntry(request.params.pluginId);
      if (!entry) throw new NotFoundError('MarketplaceEntry', request.params.pluginId);
      reply.send(entry);
    },

    async listPlugins(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const plugins = await ports.pluginRegistry.list();
      reply.send({ plugins, count: plugins.length });
    },

    async registerPlugin(
      request: FastifyRequest<{ Body: { manifest: PluginManifest } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const manifest = request.body.manifest;
      if (!manifest) throw new ValidationError('manifest is required');

      const validation = ports.manifestValidator.validate(manifest);
      if (!validation.valid) {
        throw new ValidationError(validation.errors.join('; '));
      }

      const plugin = await ports.pluginRegistry.register({ manifest });
      ports.recordPluginLifecycle(metricsExporter, 'register', plugin.manifest.id);
      reply.status(201).send(plugin);
    },

    async enablePlugin(
      request: FastifyRequest<{
        Params: { pluginId: string };
        Body: { organizationId?: string };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const { pluginId } = request.params;
      const organizationId =
        request.body?.organizationId?.trim() ||
        (typeof request.headers['x-organization-id'] === 'string'
          ? request.headers['x-organization-id']
          : undefined);

      const catalogPlugin = findCatalogPlugin(pluginId);
      if (!catalogPlugin && !(await ports.pluginRegistry.get(pluginId))) {
        throw new NotFoundError('Plugin', pluginId);
      }

      await assertAllowList(organizationId, pluginId);
      const plugin = await ports.pluginRegistry.enable(pluginId);
      ports.recordPluginLifecycle(metricsExporter, 'enable', pluginId);
      reply.send({ ...plugin, note: 'Active plugin selection applies on process restart' });
    },

    async disablePlugin(
      request: FastifyRequest<{ Params: { pluginId: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const plugin = await ports.pluginRegistry.disable(request.params.pluginId);
      ports.recordPluginLifecycle(metricsExporter, 'disable', request.params.pluginId);
      reply.send(plugin);
    },
  };
}

export type InfrastructureController = ReturnType<typeof createInfrastructureController>;
