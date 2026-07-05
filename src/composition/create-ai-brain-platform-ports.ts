import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IEventConsumer } from '../events/ievent-consumer.interface.js';
import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';
import {
  AiBrainPlatformManifestBuilder,
  HttpWebhookDispatcher,
  WebhookDeliveryConsumer,
} from '../ai-brain-platform/index.js';
import {
  SqlWebhookSubscriptionStore,
  NoOpWebhookSubscriptionStore,
} from '../infrastructure/ai-brain-platform/sql-webhook-subscription-store.js';

export interface AiBrainPlatformPorts {
  enabled: boolean;
  webhookStore: SqlWebhookSubscriptionStore | NoOpWebhookSubscriptionStore;
  manifestBuilder: AiBrainPlatformManifestBuilder;
  webhookConsumer: IEventConsumer | null;
  recordWebhookLifecycle(
    metricsExporter: IMetricsExporter | undefined,
    status: 'delivered' | 'failed',
  ): void;
}

/**
 * Composition root for Phase 24 Ratary platform umbrella (ADR-044).
 * Gated by RATARY_PLATFORM_ENABLED — default off preserves pre-Phase-24 behavior.
 */
export function createAiBrainPlatformPorts(sql: ISqlDatabase, env: Env): AiBrainPlatformPorts {
  const noopStore = new NoOpWebhookSubscriptionStore();
  const noop: AiBrainPlatformPorts = {
    enabled: false,
    webhookStore: noopStore,
    manifestBuilder: new AiBrainPlatformManifestBuilder(env, noopStore),
    webhookConsumer: null,
    recordWebhookLifecycle: () => undefined,
  };

  if (!env.RATARY_PLATFORM_ENABLED) {
    return noop;
  }

  const webhookStore = new SqlWebhookSubscriptionStore(sql);
  const manifestBuilder = new AiBrainPlatformManifestBuilder(env, webhookStore);

  let webhookConsumer: IEventConsumer | null = null;
  if (env.PLATFORM_WEBHOOKS_ENABLED) {
    const dispatcher = new HttpWebhookDispatcher();
    webhookConsumer = new WebhookDeliveryConsumer(webhookStore, dispatcher);
  }

  return {
    enabled: true,
    webhookStore,
    manifestBuilder,
    webhookConsumer,
    recordWebhookLifecycle(metricsExporter, status) {
      if (!metricsExporter) return;
      metricsExporter.incrementCounter({
        name: 'ratary_platform_webhook_dispatch_total',
        labels: { status },
      });
    },
  };
}
