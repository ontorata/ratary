import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import type { GlobalIntelligencePorts } from '../composition/create-global-intelligence-ports.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';
import { ForbiddenError, ValidationError } from '../types/errors.js';
import type { SyncTier } from '../intelligence/sync/types/sync.types.js';
import { SYNC_TIERS } from '../intelligence/sync/types/sync.types.js';

function defaultWindow(): { from: string; to: string } {
  const to = new Date().toISOString();
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  return { from, to };
}

export function createGlobalIntelligenceController(
  env: Env,
  ports: GlobalIntelligencePorts,
  scopeResolver: IScopeResolver,
) {
  function assertEnabled(): void {
    if (!ports.enabled) {
      throw new ForbiddenError(
        'Global AI intelligence platform is disabled (GLOBAL_INTELLIGENCE_PLATFORM_ENABLED=false)',
      );
    }
  }

  return {
    async getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      reply.send({
        enabled: ports.enabled,
        telemetryContentSampling: env.TELEMETRY_CONTENT_SAMPLING,
        federationComposed: env.FEDERATION_ENABLED,
      });
    },

    async getManifest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      reply.send(await ports.manifestBuilder.build(scope));
    },

    async getAdoption(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const window = defaultWindow();
      reply.send(await ports.analyticsService.adoption(scope, window));
    },

    async getWorkspaceHealth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const window = defaultWindow();
      reply.send(await ports.analyticsService.workspaceHealth(scope, window));
    },

    async getCost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const window = defaultWindow();
      reply.send(await ports.analyticsService.cost(scope, window));
    },

    async getContextEffectiveness(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const window = defaultWindow();
      reply.send(await ports.analyticsService.contextEffectiveness(scope, window));
    },

    async getSyncStatus(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      reply.send(await ports.syncOrchestrator.status(scope));
    },

    async runSync(
      request: FastifyRequest<{
        Body: {
          tier?: SyncTier;
          direction?: 'pull' | 'push' | 'bidirectional';
          since?: string;
          dryRun?: boolean;
          peerId?: string;
        };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const body = request.body ?? {};
      const tier = body.tier ?? 'workspace';
      if (!SYNC_TIERS.includes(tier)) {
        throw new ValidationError(`Invalid sync tier: ${tier}`);
      }

      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const result = await ports.syncOrchestrator.sync(
        {
          tier,
          direction: body.direction ?? 'bidirectional',
          since: body.since,
          dryRun: body.dryRun,
          peerId: body.peerId,
        },
        scope,
      );
      reply.send(result);
    },
  };
}

export type GlobalIntelligenceController = ReturnType<typeof createGlobalIntelligenceController>;
