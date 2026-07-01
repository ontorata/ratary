import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildApp } from '../dist/server.js';
import type { FastifyInstance } from 'fastify';

export const config = {
  api: {
    bodyParser: false,
  },
};

let app: FastifyInstance | undefined;
let initError: Error | undefined;

async function getApp(): Promise<FastifyInstance> {
  if (initError) throw initError;
  if (app) return app;

  try {
    app = await buildApp({
      logger: false,
      skipSwagger: true,
    });
    await app.ready();
    return app;
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    throw initError;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const fastify = await getApp();

    await new Promise<void>((resolve, reject) => {
      res.on('finish', resolve);
      res.on('error', reject);
      fastify.routing(req, res);
    });
  } catch (error) {
    console.error('Vercel handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
