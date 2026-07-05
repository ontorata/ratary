import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const servicesDir = resolve(here, '../../src/services');

const FORBIDDEN = [
  { label: 'fastify', pattern: /from ['"]fastify['"]/ },
  { label: '@fastify/*', pattern: /from ['"]@fastify\// },
  { label: '@grpc/grpc-js', pattern: /from ['"]@grpc\/grpc-js['"]/ },
  { label: '@modelcontextprotocol/sdk', pattern: /from ['"]@modelcontextprotocol\// },
  { label: 'transport layer', pattern: /from ['"].*\/transport\// },
];

function collectTsFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return collectTsFiles(full);
    return entry.isFile() && entry.name.endsWith('.ts') ? [full] : [];
  });
}

describe('Clean Architecture layer boundaries (ADR-027)', () => {
  it('services/ never imports transport frameworks or the transport layer', () => {
    const files = collectTsFiles(servicesDir);
    expect(files.length).toBeGreaterThan(0);

    const violations: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      for (const rule of FORBIDDEN) {
        if (rule.pattern.test(content)) {
          violations.push(`${file} imports ${rule.label}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
