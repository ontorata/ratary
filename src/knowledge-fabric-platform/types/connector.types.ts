export const CONNECTOR_IDS = [
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
] as const;

export type ConnectorId = (typeof CONNECTOR_IDS)[number];

export interface ConnectorDescriptor {
  id: ConnectorId;
  displayName: string;
  configured: boolean;
}

export interface ExternalKnowledgeItem {
  externalId: string;
  externalUrl?: string;
  title: string;
  body: string;
  summary?: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export interface ConnectorPullInput {
  mode: 'full' | 'incremental';
  sinceCursor?: string;
  limit?: number;
  dryRun?: boolean;
}

export interface ConnectorPullResult {
  items: ExternalKnowledgeItem[];
  nextCursor?: string;
  stats: { fetched: number; skipped: number };
}
