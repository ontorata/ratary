import type { Env } from '../../config/env.js';
import type { ConnectorId, ExternalKnowledgeItem } from '../types/connector.types.js';
import type { IKnowledgeConnector } from '../ports/iknowledge-connector.port.js';
import type { ConnectorPullInput, ConnectorPullResult } from '../types/connector.types.js';
import {
  EnvConfiguredKnowledgeConnector,
  parseKnowledgeFabricCatalog,
} from './env-configured-connector.js';
import { NotionLiveConnector } from './notion-live-connector.js';
import { ConfluenceLiveConnector } from './confluence-live-connector.js';
import { DriveLiveConnector } from './drive-live-connector.js';
import { SharePointLiveConnector } from './sharepoint-live-connector.js';
import { TeamsLiveConnector } from './teams-live-connector.js';

/** Accepts push payloads for webhook ingest (Phase 29B). */
export class WebhookPushConnector implements IKnowledgeConnector {
  private pending: ExternalKnowledgeItem[] = [];

  constructor(public readonly connectorId: ConnectorId) {}

  isConfigured(): boolean {
    return true;
  }

  setPendingItems(items: ExternalKnowledgeItem[]): void {
    this.pending = items;
  }

  async pull(input: ConnectorPullInput): Promise<ConnectorPullResult> {
    let items = [...this.pending];
    this.pending = [];

    if (input.mode === 'incremental' && input.sinceCursor) {
      items = items.filter((item) => item.updatedAt > input.sinceCursor!);
    }
    if (input.limit && input.limit > 0) {
      items = items.slice(0, input.limit);
    }

    return {
      items,
      nextCursor: items.at(-1)?.updatedAt,
      stats: { fetched: items.length, skipped: 0 },
    };
  }
}

export function createKnowledgeConnectors(env: Env): Map<ConnectorId, IKnowledgeConnector> {
  const catalog = parseKnowledgeFabricCatalog(env.KNOWLEDGE_FABRIC_CATALOG_JSON);
  const connectors = new Map<ConnectorId, IKnowledgeConnector>();

  for (const id of [
    'slack',
    'github',
    'gitlab',
    'jira',
    'confluence',
    'drive',
    'sharepoint',
    'email',
    'teams',
    'notion',
  ] as const) {
    const base = new EnvConfiguredKnowledgeConnector(env, id, catalog);
    if (id === 'notion') {
      connectors.set(id, new NotionLiveConnector(env, base));
    } else if (id === 'confluence') {
      connectors.set(id, new ConfluenceLiveConnector(env, base));
    } else if (id === 'drive') {
      connectors.set(id, new DriveLiveConnector(env, base));
    } else if (id === 'sharepoint') {
      connectors.set(id, new SharePointLiveConnector(env, base));
    } else if (id === 'teams') {
      connectors.set(id, new TeamsLiveConnector(env, base));
    } else {
      connectors.set(id, base);
    }
  }

  return connectors;
}

export function createWebhookConnectors(): Map<ConnectorId, WebhookPushConnector> {
  const map = new Map<ConnectorId, WebhookPushConnector>();
  for (const id of [
    'slack',
    'github',
    'gitlab',
    'jira',
    'confluence',
    'drive',
    'sharepoint',
    'email',
    'teams',
    'notion',
  ] as const) {
    map.set(id, new WebhookPushConnector(id));
  }
  return map;
}

export {
  EnvConfiguredKnowledgeConnector,
  NoOpKnowledgeConnector,
} from './env-configured-connector.js';
