import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const PACKAGES_ROOT = join(process.cwd(), 'packages');

const FORBIDDEN = [
  /MemoryService/i,
  /MemoryRepository/i,
  /createMemoryService/i,
  /ranking\.engine/i,
  /SELECT\s+FROM\s+memories/i,
];

function collectFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === 'generated') continue;
      collectFiles(full, acc);
    } else if (/\.(ts|tsx|js|mjs|go|py|rs|java|cs|php)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

describe('Developer platform — zero business logic in packages/', () => {
  it('packages/ has no MemoryService or ranking imports', () => {
    const files = collectFiles(PACKAGES_ROOT);
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      for (const pattern of FORBIDDEN) {
        expect(content, `${relative(process.cwd(), file)} must not match ${pattern}`).not.toMatch(
          pattern,
        );
      }
    }
  });

  it('OpenAPI SSOT exists', () => {
    const spec = readFileSync(
      join(PACKAGES_ROOT, 'openapi/ai-brain-v1.openapi.json'),
      'utf8',
    );
    const parsed = JSON.parse(spec) as { paths: Record<string, unknown> };
    expect(Object.keys(parsed.paths)).toContain('/capabilities');
    expect(Object.keys(parsed.paths)).toContain('/memory');
  });
});
