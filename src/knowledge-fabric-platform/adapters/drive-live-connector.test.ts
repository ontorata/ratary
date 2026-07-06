import { describe, expect, it } from 'vitest';
import { mapDriveFile } from './drive-live-connector.js';
import { parseGoogleServiceAccountCredentials } from './google-service-account.js';

describe('mapDriveFile', () => {
  it('maps Drive file metadata to external knowledge item', () => {
    const item = mapDriveFile({
      id: 'abc123',
      name: 'Runbook.pdf',
      modifiedTime: '2026-01-15T10:00:00.000Z',
      webViewLink: 'https://drive.google.com/file/d/abc123/view',
      mimeType: 'application/pdf',
    });

    expect(item.externalId).toBe('abc123');
    expect(item.title).toBe('Runbook.pdf');
    expect(item.externalUrl).toContain('abc123');
    expect(item.metadata).toEqual({ source: 'drive', live: true, mimeType: 'application/pdf' });
  });
});

describe('parseGoogleServiceAccountCredentials', () => {
  it('parses valid service account JSON', () => {
    const creds = parseGoogleServiceAccountCredentials(
      JSON.stringify({
        client_email: 'svc@project.iam.gserviceaccount.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n',
      }),
    );
    expect(creds.client_email).toBe('svc@project.iam.gserviceaccount.com');
    expect(creds.private_key).toContain('BEGIN PRIVATE KEY');
  });

  it('rejects invalid JSON', () => {
    expect(() => parseGoogleServiceAccountCredentials('not-json')).toThrow(/valid JSON/);
  });
});
