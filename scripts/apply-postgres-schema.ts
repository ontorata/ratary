import {
  applyPostgresSchema,
  resolvePostgresConnectionString,
} from './lib/postgres-schema.js';

function parseDatabaseUrlArg(argv: string[]): string | undefined {
  const flag = argv.find((arg) => arg.startsWith('--database-url='));
  return flag?.slice('--database-url='.length);
}

async function main(): Promise<void> {
  const overrideUrl = parseDatabaseUrlArg(process.argv.slice(2));
  const connectionString = overrideUrl ?? resolvePostgresConnectionString();

  console.log('Applying Postgres schema (idempotent)...');
  await applyPostgresSchema(connectionString);
  console.log('Postgres schema apply completed successfully.');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Postgres schema apply failed:', message);
  process.exit(1);
});
