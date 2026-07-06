import { describe, expect, it } from 'vitest';
import { mapSharePointItem } from './sharepoint-live-connector.js';
import { mapTeamsMessage } from './teams-live-connector.js';
import { parseMicrosoftGraphCredentials } from './microsoft-graph-token.js';

describe('mapSharePointItem', () => {
  it('maps Graph drive item to external knowledge item', () => {
    const item = mapSharePointItem({
      id: 'sp-1',
      name: 'Policy.docx',
      lastModifiedDateTime: '2026-01-01T00:00:00Z',
      webUrl: 'https://contoso.sharepoint.com/doc',
      file: { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    });
    expect(item.externalId).toBe('sp-1');
    expect(item.metadata?.source).toBe('sharepoint');
  });
});

describe('mapTeamsMessage', () => {
  it('strips HTML from Teams message body', () => {
    const item = mapTeamsMessage(
      {
        id: 'tm-1',
        createdDateTime: '2026-01-01T00:00:00Z',
        body: { content: '<p>Hello <b>team</b></p>' },
      },
      'general',
    );
    expect(item.body).toContain('Hello');
    expect(item.body).not.toContain('<p>');
  });
});

describe('parseMicrosoftGraphCredentials', () => {
  it('reads SharePoint-prefixed env fields', () => {
    const creds = parseMicrosoftGraphCredentials({
      SHAREPOINT_TENANT_ID: 'tenant',
      SHAREPOINT_CLIENT_ID: 'client',
      SHAREPOINT_CLIENT_SECRET: 'secret',
    } as never);
    expect(creds?.tenantId).toBe('tenant');
  });
});
