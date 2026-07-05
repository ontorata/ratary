import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

/** Domain layers that must not enforce enterprise RBAC (R10-04). */
const DOMAIN_DIRS = [
  resolve(repoRoot, 'src/services'),
  resolve(repoRoot, 'src/memory'),
  resolve(repoRoot, 'src/repositories'),
];

const FORBIDDEN = [
  { label: 'IWorkspaceMembership port', pattern: /IWorkspaceMembership/ },
  { label: 'IOrganizationStore port', pattern: /IOrganizationStore/ },
  { label: 'workspace membership adapter', pattern: /workspace-membership/ },
  { label: 'ENTERPRISE_RBAC env', pattern: /ENTERPRISE_RBAC/ },
  { label: 'assertAccess(', pattern: /\bassertAccess\s*\(/ },
];

function collectTsFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return collectTsFiles(full);
    return entry.isFile() && entry.name.endsWith('.ts') ? [full] : [];
  });
}

describe('Phase 10 enterprise layer boundaries (R10-04)', () => {
  it('services/, memory/, and repositories/ do not import enterprise RBAC ports', () => {
    const violations: string[] = [];

    for (const dir of DOMAIN_DIRS) {
      for (const file of collectTsFiles(dir)) {
        const content = readFileSync(file, 'utf8');
        for (const rule of FORBIDDEN) {
          if (rule.pattern.test(content)) {
            violations.push(`${file} references ${rule.label}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
