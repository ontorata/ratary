import { buildApp } from './server.js';
import { runMigrations } from './db/index.js';
import { getEnv } from './config/index.js';

async function main(): Promise<void> {
  const env = getEnv();

  console.log('Running database migrations...');
  await runMigrations();
  console.log('Migrations complete.');

  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`AI Memory Cloud running at http://localhost:${env.PORT}`);
    console.log(`API docs at http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
