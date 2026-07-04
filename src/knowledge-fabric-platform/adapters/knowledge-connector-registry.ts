import type { Env } from '../../config/env.js';
import type {
  ConnectorId,
  ConnectorPullInput,
  ConnectorPullResult,
  ExternalKnowledgeItem,
} from '../types/connector.types.js';
import type { IKnowledgeConnector } from '../ports/iknowledge-connector.port.js';

const CONNECTOR_ENV_KEYS: Partial<Record<ConnectorId, keyof Env>> = {
  slack: 'SLACK_BOT_TOKEN',
  github: 'GITHUB_TOKEN',
  gitlab: 'GITLAB_TOKEN',
  jira: 'JIRA_API_TOKEN',
  confluence: 'CONFLUENCE_API_TOKEN',
  drive: 'GOOGLE_DRIVE_CREDENTIALS_JSON',
  sharepoint: 'SHAREPOINT_CLIENT_SECRET',
  email: 'FABRIC_EMAIL_IMAP_URL',
  teams: 'TEAMS_WEBHOOK_URL',
  notion: 'NOTION_API_TOKEN',
};

type CatalogMap = Partial<Record<ConnectorId, ExternalKnowledgeItem[]>>;

function parseCatalog(raw: string): CatalogMap {
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as CatalogMap;
  } catch {
    return {};
  }
}

/** Env-token connector — pull deferred until vendor SDK wiring (Phase 23 MVP). */
export class EnvConfiguredKnowledgeConnector implements IKnowledgeConnector {
  constructor(
    private readonly env: Env,
    public readonly connectorId: ConnectorId,
    private readonly catalog: CatalogMap,
  ) {}

  isConfigured(): boolean {
    const catalogItems = this.catalog[this.connectorId];
    if (catalogItems && catalogItems.length > 0) return true;
    const key = CONNECTOR_ENV_KEYS[this.connectorId];
    if (!key) return false;
    const value = this.env[key];
    return typeof value === 'string' && value.trim().length > 0;
  }

  async pull(input: ConnectorPullInput): Promise<ConnectorPullResult> {
    const catalogItems = this.catalog[this.connectorId] ?? [];
    let items = catalogItems;

    if (input.mode === 'incremental' && input.sinceCursor) {
      items = items.filter((item) => item.updatedAt > input.sinceCursor!);
    }

    if (input.limit && input.limit > 0) {
      items = items.slice(0, input.limit);
    }

    const nextCursor = items.at(-1)?.updatedAt;

    return {
      items,
      nextCursor,
      stats: { fetched: items.length, skipped: catalogItems.length - items.length },
    };
  }
}

export function createKnowledgeConnectors(env: Env): Map<ConnectorId, IKnowledgeConnector> {
  const catalog = parseCatalog(env.KNOWLEDGE_FABRIC_CATALOG_JSON);
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
    connectors.set(id, new EnvConfiguredKnowledgeConnector(env, id, catalog));
  }

  return connectors;
}

export class NoOpKnowledgeConnector implements IKnowledgeConnector {
  constructor(public readonly connectorId: ConnectorId) {}

  isConfigured(): boolean {
    return false;
  }

  async pull(): Promise<ConnectorPullResult> {
    throw new Error('Knowledge fabric platform disabled');
  }
}
