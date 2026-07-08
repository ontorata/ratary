import type { Env } from '../../config/env.js';
import type { IKnowledgeConnector } from '../ports/iknowledge-connector.port.js';
import type {
  ConnectorPullInput,
  ConnectorPullResult,
  ExternalKnowledgeItem,
} from '../types/connector.types.js';
import type { EnvConfiguredKnowledgeConnector } from './env-configured-connector.js';
import {
  canUseMicrosoftGraph,
  fetchMicrosoftGraphAccessToken,
  parseMicrosoftGraphCredentials,
} from './microsoft-graph-token.js';

interface GraphDriveItem {
  id: string;
  name: string;
  lastModifiedDateTime: string;
  webUrl?: string;
  file?: { mimeType?: string };
  folder?: Record<string, unknown>;
}

interface GraphListResponse {
  value?: GraphDriveItem[];
  '@odata.nextLink'?: string;
}

export function mapSharePointItem(item: GraphDriveItem): ExternalKnowledgeItem {
  const url = item.webUrl ?? `https://graph.microsoft.com/v1.0/drives/items/${item.id}`;
  return {
    externalId: item.id,
    externalUrl: url,
    title: item.name,
    body: `[SharePoint item](${url})`,
    summary: item.name,
    updatedAt: item.lastModifiedDateTime,
    metadata: { source: 'sharepoint', live: true, mimeType: item.file?.mimeType },
  };
}

/** Live SharePoint / OneDrive via Microsoft Graph (Phase 34). */
export class SharePointLiveConnector implements IKnowledgeConnector {
  readonly connectorId = 'sharepoint' as const;

  constructor(
    private readonly env: Env,
    private readonly fallback: EnvConfiguredKnowledgeConnector,
  ) {}

  isConfigured(): boolean {
    return (
      (canUseMicrosoftGraph(this.env) && Boolean(this.env.SHAREPOINT_SITE_ID?.trim())) ||
      this.fallback.isConfigured()
    );
  }

  async pull(input: ConnectorPullInput): Promise<ConnectorPullResult> {
    if (!canUseMicrosoftGraph(this.env)) {
      return this.fallback.pull(input);
    }

    const creds = parseMicrosoftGraphCredentials(this.env)!;
    const token = await fetchMicrosoftGraphAccessToken(creds);
    const siteId = this.env.SHAREPOINT_SITE_ID?.trim();
    if (!siteId) {
      throw new Error(
        'SHAREPOINT_SITE_ID is required for SharePoint live connector (app-only auth)',
      );
    }

    const pageSize = Math.min(input.limit ?? 25, 100);
    const graphUrl = new URL(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root/children`,
    );
    graphUrl.searchParams.set('$top', String(pageSize));
    graphUrl.searchParams.set('$orderby', 'lastModifiedDateTime desc');

    const response = await fetch(graphUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Microsoft Graph SharePoint ${response.status}: ${text.slice(0, 300)}`);
    }

    const data = (await response.json()) as GraphListResponse;
    let items = (data.value ?? []).filter((item) => !item.folder).map(mapSharePointItem);

    if (input.mode === 'incremental' && input.sinceCursor) {
      items = items.filter((item) => item.updatedAt > input.sinceCursor!);
    }

    if (input.limit && input.limit > 0) {
      items = items.slice(0, input.limit);
    }

    return {
      items,
      nextCursor: items.at(-1)?.updatedAt ?? data['@odata.nextLink'],
      stats: { fetched: items.length, skipped: 0 },
    };
  }
}
