/**
 * Generate language SDKs from packages/openapi/ratary-v1.openapi.json via OpenAPI Generator.
 * Requires: npx @openapitools/openapi-generator-cli (Java runtime optional for some generators).
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const SPEC = resolve(process.cwd(), 'packages/openapi/ratary-v1.openapi.json');

const TARGETS: Array<{ generator: string; outDir: string; extra?: string }> = [
  { generator: 'go', outDir: 'packages/sdk-go/generated' },
  { generator: 'python', outDir: 'packages/sdk-python/generated' },
  { generator: 'java', outDir: 'packages/sdk-java/generated' },
  { generator: 'rust', outDir: 'packages/sdk-rust/generated' },
  { generator: 'csharp', outDir: 'packages/sdk-csharp/generated' },
  { generator: 'php', outDir: 'packages/sdk-php/generated' },
];

function runGenerator(generator: string, outDir: string, extra = ''): void {
  const absOut = resolve(process.cwd(), outDir);
  const cmd = [
    'npx',
    '--yes',
    '@openapitools/openapi-generator-cli',
    'generate',
    '-i',
    SPEC,
    '-g',
    generator,
    '-o',
    absOut,
    '--additional-properties=packageName=ratary_sdk,packageVersion=1.1.0',
    extra,
  ]
    .filter(Boolean)
    .join(' ');

  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function main(): void {
  if (!existsSync(SPEC)) {
    throw new Error(`OpenAPI spec not found: ${SPEC}`);
  }

  for (const target of TARGETS) {
    runGenerator(target.generator, target.outDir, target.extra ?? '');
  }

  console.log('\nSDK generation complete. TypeScript reference: packages/sdk (hand-written).');
}

main();
