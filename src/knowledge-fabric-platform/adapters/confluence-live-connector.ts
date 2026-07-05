import type { Env } from '../../config/env.js';
import type { IKnowledgeConnector } from '../ports/iknowledge-connector.port.js';
import type {
  ConnectorPullInput,
  ConnectorPullResult,
  ExternalKnowledgeItem,
} from '../types/connector.types.js';
import type { EnvConfiguredKnowledgeConnector } from './env-configured-connector.js';

interface ConfluencePage {
  id: string;
  title: string;
  createdAt: string;
  version?: { createdAt: string; number: number };
  _links?: { webui?: string; base?: string };
}

interface ConfluencePagesResponse {
  results: ConfluencePage[];
  _links?: { next?: string };
}

function confluenceWebUrl(page: ConfluencePage, baseUrl: string): string {
  const webui = page._links?.webui;
  if (webui?.startsWith('http')) return webui;
  if (webui) return `${baseUrl}${webui}`;
  return `${baseUrl}/wiki/spaces/pages/${page.id}`;
}

function mapConfluencePage(page: ConfluencePage, baseUrl: string): ExternalKnowledgeItem {
  const updatedAt = page.version?.createdAt ?? page.createdAt;
  const url = confluenceWebUrl(page, baseUrl);
  return {
    externalId: page.id,
    externalUrl: url,
    title: page.title,
    body: `[Confluence page](${url})`,
    summary: page.title,
    updatedAt,
    metadata: { source: 'confluence', live: true },
  };
}

/** Live Confluence Cloud REST v2 adapter (post–Phase 29). */
export class ConfluenceLiveConnector implements IKnowledgeConnector {
  readonly connectorId = 'confluence' as const;

  constructor(
    private readonly env: Env,
    private readonly fallback: EnvConfiguredKnowledgeConnector,
  ) {}

  isConfigured(): boolean {
    return this.canUseLiveApi() || this.fallback.isConfigured();
  }

  async pull(input: ConnectorPullInput): Promise<ConnectorPullResult> {
    if (!this.canUseLiveApi()) {
      return this.fallback.pull(input);
    }

    const baseUrl = this.normalizeBaseUrl(this.env.CONFLUENCE_BASE_URL!);
    const pageSize = Math.min(input.limit ?? 25, 100);
    const url = new URL(`${baseUrl}/wiki/api/v2/pages`);
    url.searchParams.set('limit', String(pageSize));

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        Authorization: this.authHeader(),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Confluence API ${response.status}: ${text.slice(0, 200)}`);
    }

    const data = (await response.json()) as ConfluencePagesResponse;
    let items = (data.results ?? []).map((p) => mapConfluencePage(p, baseUrl));

    if (input.mode === 'incremental' && input.sinceCursor) {
      items = items.filter((item) => item.updatedAt > input.sinceCursor!);
    }

    const nextCursor = items.at(-1)?.updatedAt;

    return {
      items,
      nextCursor,
      stats: { fetched: items.length, skipped: 0 },
    };
  }

  private canUseLiveApi(): boolean {
    if (!this.env.CONNECTOR_SYNC_ENABLED || !this.env.KNOWLEDGE_FABRIC_ENABLED) return false;
    const token = this.env.CONFLUENCE_API_TOKEN?.trim();
    const base = this.env.CONFLUENCE_BASE_URL?.trim();
    const email = this.env.CONFLUENCE_EMAIL?.trim();
    return Boolean(token && base && email);
  }

  private normalizeBaseUrl(raw: string): string {
    return raw.replace(/\/+$/, '');
  }

  private authHeader(): string {
    const email = this.env.CONFLUENCE_EMAIL!.trim();
    const token = this.env.CONFLUENCE_API_TOKEN!.trim();
    const encoded = Buffer.from(`${email}:${token}`).toString('base64');
    return `Basic ${encoded}`;
  }
}
