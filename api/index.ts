import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildApp } from '../src/server.js';
import type { FastifyInstance } from 'fastify';

export const config = {
  api: {
    bodyParser: false,
  },
};

let app: FastifyInstance | undefined;

async function getApp(): Promise<FastifyInstance> {
  if (!app) {
    app = await buildApp({ logger: !process.env.VERCEL });
    await app.ready();
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const fastify = await getApp();
  fastify.server.emit('request', req, res);
}
