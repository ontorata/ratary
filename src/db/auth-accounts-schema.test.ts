import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { MIGRATION_SQL } from './migrations.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('auth accounts schema portability', () => {
  const schemaSql = readFileSync(join(ROOT, 'schema.sql'), 'utf8');

  const requiredFragments = [
    'CREATE TABLE IF NOT EXISTS auth_accounts',
    'CREATE TABLE IF NOT EXISTS auth_login_attempts',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_accounts_email ON auth_accounts(email)',
    'FOREIGN KEY (identity_id) REFERENCES identities(id)',
  ];

  it('includes auth account tables in canonical schema.sql', () => {
    for (const fragment of requiredFragments) {
      expect(schemaSql).toContain(fragment);
    }
  });

  it('includes auth account tables in MIGRATION_SQL', () => {
    for (const fragment of requiredFragments) {
      expect(MIGRATION_SQL).toContain(fragment);
    }
  });

  it('avoids dialect-specific types in auth account DDL', () => {
    const authBlock = MIGRATION_SQL.slice(
      MIGRATION_SQL.indexOf('CREATE TABLE IF NOT EXISTS auth_accounts'),
      MIGRATION_SQL.indexOf('CREATE TABLE IF NOT EXISTS auth_login_attempts') + 200,
    );
    expect(authBlock).not.toMatch(/\b(UUID|JSONB|BOOLEAN|TIMESTAMPTZ|SERIAL)\b/i);
    expect(authBlock).not.toMatch(/WHERE\s+active\s*=\s*1/);
  });
});
