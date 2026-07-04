import { createHmac } from 'node:crypto';
import type { EventEnvelope } from '../../ports/events/ievent-bus.port.js';
import type { IWebhookDispatcher, WebhookDispatchResult } from '../ports/iwebhook-dispatcher.port.js';
import type { WebhookSubscription } from '../types/platform.types.js';

/** HTTP POST webhook delivery with optional HMAC signature (Phase 24). */
export class HttpWebhookDispatcher implements IWebhookDispatcher {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async dispatch(
    subscription: WebhookSubscription,
    event: EventEnvelope<unknown>,
  ): Promise<WebhookDispatchResult> {
    const body = JSON.stringify({
      id: event.correlationId ?? `${event.topic}:${event.occurredAt}`,
      topic: event.topic,
      occurredAt: event.occurredAt,
      correlationId: event.correlationId,
      payload: event.payload,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Topic': event.topic,
    };

    if (subscription.secret) {
      const signature = createHmac('sha256', subscription.secret).update(body).digest('hex');
      headers['X-Webhook-Signature'] = `sha256=${signature}`;
    }

    try {
      const response = await this.fetchFn(subscription.url, {
        method: 'POST',
        headers,
        body,
      });

      return {
        subscriptionId: subscription.id,
        delivered: response.ok,
        statusCode: response.status,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        subscriptionId: subscription.id,
        delivered: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export class NoOpWebhookDispatcher implements IWebhookDispatcher {
  async dispatch(subscription: WebhookSubscription): Promise<WebhookDispatchResult> {
    return { subscriptionId: subscription.id, delivered: false, error: 'Webhooks disabled' };
  }
}
