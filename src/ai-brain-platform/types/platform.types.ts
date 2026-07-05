export const PLATFORM_EDITIONS = ['core', 'standard', 'enterprise'] as const;
export type PlatformEdition = (typeof PLATFORM_EDITIONS)[number];

export const PLATFORM_PLANE_IDS = [
  'developer',
  'protocol',
  'events',
  'extension',
  'deployment',
  'knowledge',
  'webhooks',
] as const;
export type PlatformPlaneId = (typeof PLATFORM_PLANE_IDS)[number];

export interface PlatformPlaneStatus {
  id: PlatformPlaneId;
  label: string;
  enabled: boolean;
  availableInEdition: boolean;
}

export interface AiBrainPlatformManifest {
  platform: 'ratary-platform';
  edition: PlatformEdition;
  planes: PlatformPlaneStatus[];
  webhooksEnabled: boolean;
  activeWebhookCount: number;
  composedPhases: string[];
}

export interface WebhookSubscription {
  id: string;
  ownerId: string;
  workspaceId?: string;
  url: string;
  secret?: string;
  topics: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookSubscriptionInput {
  url: string;
  secret?: string;
  topics: string[];
  active?: boolean;
}

export interface UpdateWebhookSubscriptionInput {
  url?: string;
  secret?: string;
  topics?: string[];
  active?: boolean;
}
