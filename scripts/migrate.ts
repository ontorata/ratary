import { getD1Client, runMigrations } from '../src/db/index.js';

async function migrate(): Promise<void> {
  console.log('Connecting to Cloudflare D1...');
  const client = getD1Client();
  await runMigrations(client);
  console.log('Migration completed successfully.');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
