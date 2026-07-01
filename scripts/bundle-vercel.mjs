import * as esbuild from 'esbuild';
import { statSync } from 'node:fs';

await esbuild.build({
  entryPoints: ['api/handler.ts'],
  outfile: 'api/index.js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  packages: 'external',
  minify: true,
  logLevel: 'info',
});

const bytes = statSync('api/index.js').size;
console.log(`Vercel API bundle: api/index.js (${(bytes / 1024).toFixed(1)} KB, deps external)`);
