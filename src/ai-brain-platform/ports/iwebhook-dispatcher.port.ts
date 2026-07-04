import type { EventEnvelope } from '../../ports/events/ievent-bus.port.js';
import type { WebhookSubscription } from '../types/platform.types.js';

export interface WebhookDispatchResult {
  subscriptionId: string;
  delivered: boolean;
  statusCode?: number;
  error?: string;
}

/** Delivers domain events to outbound webhook URLs (Phase 24). */
export interface IWebhookDispatcher {
  dispatch(
    subscription: WebhookSubscription,
    event: EventEnvelope<unknown>,
  ): Promise<WebhookDispatchResult>;
}
