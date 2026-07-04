import type { FastifyInstance } from 'fastify';
import { getEnv } from '../../config/index.js';
import type { ITransportServer, TransportHealth } from '../registry/itransport-server.interface.js';
import { buildApp } from './rest-server.js';

export interface RestTransportOptions {
  port?: number;
  host?: string;
  logger?: boolean;
  skipAuth?: boolean;
  skipSwagger?: boolean;
}

/**
 * REST transport server (ADR-027 Phase 10.5C) — wraps the Fastify app in the
 * ITransportServer lifecycle. Owns listen/close only; no business logic.
 */
export class RestTransportServer implements ITransportServer {
  readonly protocol = 'rest' as const;
  private app: FastifyInstance | null = null;
  private listening = false;

  constructor(private readonly options: RestTransportOptions = {}) {}

  async start(): Promise<void> {
    if (this.listening) return;
    const env = getEnv();
    this.app = await buildApp({
      logger: this.options.logger,
      skipAuth: this.options.skipAuth,
      skipSwagger: this.options.skipSwagger,
    });
    await this.app.listen({
      port: this.options.port ?? env.PORT,
      host: this.options.host ?? '0.0.0.0',
    });
    this.listening = true;
  }

  async stop(): Promise<void> {
    if (this.app) {
      await this.app.close();
      this.app = null;
    }
    this.listening = false;
  }

  health(): TransportHealth {
    return { status: this.listening ? 'ok' : 'down', details: { version: 'v1' } };
  }

  /** Expose the underlying instance for embedding scenarios (Vercel handler, tests). */
  instance(): FastifyInstance | null {
    return this.app;
  }
}
