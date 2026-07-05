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

  console.log(`Ratary running at http://localhost:${env.PORT}`);
  console.log(`API docs at http://localhost:${env.PORT}/docs`);
  console.log(`Active transports: ${registry.listActive().join(', ')}`);
  if (env.GRPC_ENABLED) {
    console.log(`gRPC listening on ${env.GRPC_HOST}:${env.GRPC_PORT}`);
  }
  if (env.SSE_ENABLED) {
    console.log('SSE context stream at GET /api/v1/context/stream');
  }
  if (env.WEBSOCKET_ENABLED) {
    console.log(`WebSocket at ${env.WEBSOCKET_PATH}`);
  }
  if (env.REMOTE_MCP_ENABLED) {
    console.log(`Remote MCP at ${env.REMOTE_MCP_PATH}`);
  }
}

main();
