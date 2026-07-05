import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import type { AiBrainPlatformPorts } from '../composition/create-ai-brain-platform-ports.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';
import { ForbiddenError, ValidationError } from '../types/errors.js';
import { DomainEventTopics } from '../events/domain-event-topics.js';

const ALLOWED_TOPICS = new Set<string>(Object.values(DomainEventTopics));

export function createAiBrainPlatformController(
  env: Env,
  ports: AiBrainPlatformPorts,
  scopeResolver: IScopeResolver,
) {
  function assertEnabled(): void {
    if (!ports.enabled) {
      throw new ForbiddenError(
        'Ratary platform is disabled (RATARY_PLATFORM_ENABLED=false)',
      );
    }
  }

  function assertWebhooksEnabled(): void {
    assertEnabled();
    if (!env.PLATFORM_WEBHOOKS_ENABLED) {
      throw new ForbiddenError(
        'Platform webhooks are disabled (PLATFORM_WEBHOOKS_ENABLED=false)',
      );
    }
  }

  function validateTopics(topics: string[]): void {
    for (const topic of topics) {
      if (!ALLOWED_TOPICS.has(topic)) {
        throw new ValidationError(`Invalid topic: ${topic}`);
      }
    }
  }

  return {
    async getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      reply.send({
        enabled: ports.enabled,
        edition: env.RATARY_PLATFORM_EDITION,
        webhooksEnabled: env.PLATFORM_WEBHOOKS_ENABLED,
      });
    },

    async getManifest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      reply.send(await ports.manifestBuilder.build(scope));
    },

    async listWebhooks(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertWebhooksEnabled();
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const subscriptions = await ports.webhookStore.list(scope);
      reply.send({ subscriptions, count: subscriptions.length });
    },

    async createWebhook(
      request: FastifyRequest<{
        Body: { url?: string; secret?: string; topics?: string[]; active?: boolean };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertWebhooksEnabled();
      const body = request.body ?? {};
      if (!body.url?.trim()) throw new ValidationError('url is required');
      if (!body.topics?.length) throw new ValidationError('topics is required');
      validateTopics(body.topics);

      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const subscription = await ports.webhookStore.create(scope, {
        url: body.url.trim(),
        secret: body.secret?.trim(),
        topics: body.topics,
        active: body.active,
      });
      reply.status(201).send(subscription);
    },

    async deleteWebhook(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertWebhooksEnabled();
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      await ports.webhookStore.delete(scope, request.params.id);
      reply.status(204).send();
    },
  };
}

export type AiBrainPlatformController = ReturnType<typeof createAiBrainPlatformController>;
