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

interface TeamsMessage {
  id: string;
  createdDateTime: string;
  body?: { content?: string };
  webUrl?: string;
}

interface GraphMessagesResponse {
  value?: TeamsMessage[];
}

export function mapTeamsMessage(msg: TeamsMessage, channelLabel: string): ExternalKnowledgeItem {
  const preview = (msg.body?.content ?? '')
    .replace(/<[^>]+>/g, '')
    .trim()
    .slice(0, 200);
  const title = preview ? preview.slice(0, 80) : `Teams message ${msg.id}`;
  const url = msg.webUrl ?? `teams://message/${msg.id}`;
  return {
    externalId: msg.id,
    externalUrl: url,
    title,
    body: preview || title,
    summary: title,
    updatedAt: msg.createdDateTime,
    metadata: { source: 'teams', live: true, channel: channelLabel },
  };
}

/** Live Microsoft Teams channel messages via Graph (Phase 34). */
export class TeamsLiveConnector implements IKnowledgeConnector {
  readonly connectorId = 'teams' as const;

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

    const creds = parseMicrosoftGraphCredentials(this.env)!;
    const token = await fetchMicrosoftGraphAccessToken(creds);
    const teamId = this.env.TEAMS_TEAM_ID!.trim();
    const channelId = this.env.TEAMS_CHANNEL_ID!.trim();
    const pageSize = Math.min(input.limit ?? 25, 50);

    const url = `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages?$top=${pageSize}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Microsoft Graph Teams ${response.status}: ${text.slice(0, 300)}`);
    }

    const data = (await response.json()) as GraphMessagesResponse;
    let items = (data.value ?? []).map((m) => mapTeamsMessage(m, channelId));

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

  private canUseLiveApi(): boolean {
    if (!canUseMicrosoftGraph(this.env)) return false;
    return Boolean(this.env.TEAMS_TEAM_ID?.trim() && this.env.TEAMS_CHANNEL_ID?.trim());
  }
}
