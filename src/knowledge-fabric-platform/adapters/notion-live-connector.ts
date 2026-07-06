import type { Env } from '../../config/env.js';
import type { IKnowledgeConnector } from '../ports/iknowledge-connector.port.js';
import type {
  ConnectorPullInput,
  ConnectorPullResult,
  ExternalKnowledgeItem,
} from '../types/connector.types.js';
import type { EnvConfiguredKnowledgeConnector } from './env-configured-connector.js';

const NOTION_VERSION = '2022-06-28';

interface NotionRichText {
  plain_text?: string;
}

interface NotionPage {
  id: string;
  url?: string;
  last_edited_time: string;
  properties?: Record<string, { title?: NotionRichText[]; rich_text?: NotionRichText[] }>;
}

interface NotionSearchResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

function extractNotionTitle(page: NotionPage): string {
  if (!page.properties) return `Notion ${page.id}`;
  for (const prop of Object.values(page.properties)) {
    const titleBits = prop.title ?? prop.rich_text;
    if (titleBits?.length) {
      return (
        titleBits
          .map((t) => t.plain_text ?? '')
          .join('')
          .trim() || `Notion ${page.id}`
      );
    }
  }
  return `Notion ${page.id}`;
}

function mapNotionPage(page: NotionPage): ExternalKnowledgeItem {
  const title = extractNotionTitle(page);
  const url = page.url ?? `https://notion.so/${page.id.replace(/-/g, '')}`;
  return {
    externalId: page.id,
    externalUrl: url,
    title,
    body: `[Notion page](${url})`,
    summary: title,
    updatedAt: page.last_edited_time,
    metadata: { source: 'notion', live: true },
  };
}

/** Live Notion API adapter (Phase 29). Falls back to catalog/env stub when sync disabled. */
export class NotionLiveConnector implements IKnowledgeConnector {
  readonly connectorId = 'notion' as const;

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

    const token = this.env.NOTION_API_TOKEN!.trim();
    const pageSize = Math.min(input.limit ?? 25, 100);
    const body: Record<string, unknown> = {
      page_size: pageSize,
      filter: { property: 'object', value: 'page' },
    };
    if (input.sinceCursor) {
      body.start_cursor = input.sinceCursor;
    }

    let response: Response;
    try {
      response = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': this.env.NOTION_API_VERSION ?? NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Notion API request failed: ${message}`);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Notion API error (${response.status}): ${text.slice(0, 300)}`);
    }

    const data = (await response.json()) as NotionSearchResponse;
    let items = data.results.map(mapNotionPage);

    if (input.mode === 'incremental' && input.sinceCursor && !body.start_cursor) {
      items = items.filter((item) => item.updatedAt > input.sinceCursor!);
    }

    if (input.limit && input.limit > 0) {
      items = items.slice(0, input.limit);
    }

    const nextCursor = data.next_cursor ?? items.at(-1)?.updatedAt;

    return {
      items,
      nextCursor: nextCursor ?? undefined,
      stats: { fetched: items.length, skipped: 0 },
    };
  }

  private canUseLiveApi(): boolean {
    return (
      this.env.CONNECTOR_SYNC_ENABLED &&
      typeof this.env.NOTION_API_TOKEN === 'string' &&
      this.env.NOTION_API_TOKEN.trim().length > 0
    );
  }
}
