import { runMigrations } from './db/index.js';
import { getEnv } from './config/index.js';
import { startTransports } from './transport/registry/start-transports.js';

async function main(): Promise<void> {
  const env = getEnv();

  console.log('Running database migrations...');
  await runMigrations();
  console.log('Migrations complete.');

  const registry = await startTransports();

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down transports...`);
    try {
      await registry.stopAll();
      process.exit(0);
    } catch (error) {
      console.error('shutdown error', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  console.log(`AI Memory Cloud running at http://localhost:${env.PORT}`);
  console.log(`API docs at http://localhost:${env.PORT}/docs`);
  console.log(`Active transports: ${registry.listActive().join(', ')}`);
  if (env.GRPC_ENABLED) {
    console.log(`gRPC listening on ${env.GRPC_HOST}:${env.GRPC_PORT}`);
  }
}

main();
