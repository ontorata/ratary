import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['api/handler.ts'],
  outfile: 'api/index.js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  packages: 'bundle',
  logLevel: 'info',
});

console.log('Vercel API bundle: api/index.js');
