import type { MemoryScope } from '../../types/memory-scope.js';
import type {
  CreateWebhookSubscriptionInput,
  UpdateWebhookSubscriptionInput,
  WebhookSubscription,
} from '../types/platform.types.js';

/** Outbound webhook subscription persistence (Phase 24). */
export interface IWebhookSubscriptionStore {
  create(scope: MemoryScope, input: CreateWebhookSubscriptionInput): Promise<WebhookSubscription>;
  update(
    scope: MemoryScope,
    id: string,
    input: UpdateWebhookSubscriptionInput,
  ): Promise<WebhookSubscription>;
  delete(scope: MemoryScope, id: string): Promise<void>;
  list(scope: MemoryScope): Promise<WebhookSubscription[]>;
  findActiveByTopic(topic: string, ownerId: string): Promise<WebhookSubscription[]>;
  countActive(scope: MemoryScope): Promise<number>;
}
