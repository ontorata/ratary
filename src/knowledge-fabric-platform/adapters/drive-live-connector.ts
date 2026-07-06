import type { Env } from '../../config/env.js';
import type { IKnowledgeConnector } from '../ports/iknowledge-connector.port.js';
import type {
  ConnectorPullInput,
  ConnectorPullResult,
  ExternalKnowledgeItem,
} from '../types/connector.types.js';
import type { EnvConfiguredKnowledgeConnector } from './env-configured-connector.js';
import { fetchGoogleServiceAccountAccessToken } from './google-service-account.js';

const DRIVE_READONLY_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
  mimeType?: string;
}

interface DriveListResponse {
  files?: DriveFile[];
  nextPageToken?: string;
}

export function mapDriveFile(file: DriveFile): ExternalKnowledgeItem {
  const url = file.webViewLink ?? `https://drive.google.com/file/d/${file.id}/view`;
  return {
    externalId: file.id,
    externalUrl: url,
    title: file.name,
    body: `[Google Drive file](${url})`,
    summary: file.name,
    updatedAt: file.modifiedTime,
    metadata: { source: 'drive', live: true, mimeType: file.mimeType },
  };
}

/** Live Google Drive API v3 adapter (service account). */
export class DriveLiveConnector implements IKnowledgeConnector {
  readonly connectorId = 'drive' as const;

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

    const token = await fetchGoogleServiceAccountAccessToken(
      this.env.GOOGLE_DRIVE_CREDENTIALS_JSON!,
      [DRIVE_READONLY_SCOPE],
    );

    const pageSize = Math.min(input.limit ?? 25, 100);
    const qParts = ["trashed=false", "mimeType!='application/vnd.google-apps.folder'"];
    const folderId = this.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
    if (folderId) {
      qParts.push(`'${folderId}' in parents`);
    }
    if (input.mode === 'incremental' && input.sinceCursor && /^\d{4}-\d{2}-\d{2}/.test(input.sinceCursor)) {
      qParts.push(`modifiedTime > '${input.sinceCursor}'`);
    }

    const url = new URL('https://www.googleapis.com/drive/v3/files');
    url.searchParams.set('pageSize', String(pageSize));
    url.searchParams.set('orderBy', 'modifiedTime desc');
    url.searchParams.set(
      'fields',
      'nextPageToken,files(id,name,modifiedTime,webViewLink,mimeType)',
    );
    url.searchParams.set('q', qParts.join(' and '));
    if (input.sinceCursor && !/^\d{4}-\d{2}-\d{2}/.test(input.sinceCursor)) {
      url.searchParams.set('pageToken', input.sinceCursor);
    }

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google Drive API ${response.status}: ${text.slice(0, 300)}`);
    }

    const data = (await response.json()) as DriveListResponse;
    let items = (data.files ?? []).map(mapDriveFile);

    if (input.limit && input.limit > 0) {
      items = items.slice(0, input.limit);
    }

    const nextCursor = data.nextPageToken ?? items.at(-1)?.updatedAt;

    return {
      items,
      nextCursor,
      stats: { fetched: items.length, skipped: 0 },
    };
  }

  private canUseLiveApi(): boolean {
    if (!this.env.CONNECTOR_SYNC_ENABLED || !this.env.KNOWLEDGE_FABRIC_ENABLED) return false;
    const raw = this.env.GOOGLE_DRIVE_CREDENTIALS_JSON?.trim();
    return Boolean(raw && raw.startsWith('{'));
  }
}
