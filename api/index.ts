import type { IncomingMessage, ServerResponse } from 'node:http';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildApp } from '../src/server.js';
import type { FastifyInstance } from 'fastify';

export const config = {
  api: {
    bodyParser: false,
  },
};

let app: FastifyInstance | undefined;
let initError: Error | undefined;

function normalizeRequestUrl(req: IncomingMessage): void {
  if (!req.url || req.url === '') {
    req.url = '/';
    return;
  }

  const originalUrl = req.headers['x-vercel-original-url'];
  if (typeof originalUrl === 'string' && originalUrl.length > 0) {
    try {
      const parsed = new URL(originalUrl, 'http://localhost');
      req.url = parsed.pathname + parsed.search;
    } catch {
      // keep existing url
    }
  }
}

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

function runFastify(
  fastify: FastifyInstance,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      res.off('finish', onFinish);
      res.off('close', onClose);
      res.off('error', onError);
    };

    const onFinish = () => {
      cleanup();
      resolve();
    };

    const onClose = () => {
      cleanup();
      resolve();
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    res.on('finish', onFinish);
    res.on('close', onClose);
    res.on('error', onError);

    try {
      normalizeRequestUrl(req);
      fastify.routing(req, res);
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const fastify = await getApp();
    await runFastify(fastify, req, res);
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
