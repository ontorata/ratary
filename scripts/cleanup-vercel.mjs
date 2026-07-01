import { rmSync } from 'node:fs';

if (!process.env.VERCEL) {
  console.log('Skipping deployment cleanup (not running on Vercel)');
  process.exit(0);
}

for (const path of ['src', 'vercel']) {
  rmSync(path, { recursive: true, force: true });
}

console.log('Removed src/ and vercel/ from deployment artifact');
