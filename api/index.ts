import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildApp } from '../src/server.js';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance | null = null;

async function getApp(): Promise<FastifyInstance> {
  if (!app) {
    app = await buildApp({ logger: true });
    await app.ready();
  }
  return app;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const fastify = await getApp();
  fastify.server.emit('request', req, res);
}
