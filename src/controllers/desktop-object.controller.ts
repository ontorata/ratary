import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IObjectStorage } from '../ports/storage/iobject-storage.port.js';
import { ValidationError, UnauthorizedError } from '../types/errors.js';

function normalizeKey(raw: string): string {
  const key = decodeURIComponent(raw).replace(/\\/g, '/').replace(/^\/+/, '');
  if (!key || key.includes('..') || key.length > 1024) {
    throw new ValidationError('Invalid object key');
  }
  return key;
}

function storageKey(ownerId: string, objectKey: string) {
  return { segments: [ownerId, 'desktop', ...objectKey.split('/').filter(Boolean)] as const };
}

export class DesktopObjectController {
  constructor(private readonly objectStorage: IObjectStorage) {}

  private ownerId(request: FastifyRequest): string {
    const ownerId = request.user?.ownerId;
    if (!ownerId) throw new UnauthorizedError('Authentication required');
    return ownerId;
  }

  private keyFromRequest(request: FastifyRequest): string {
    const params = request.params as { '*': string } | { key?: string };
    const raw = '*' in params ? params['*'] : (params.key ?? '');
    return normalizeKey(raw);
  }

  async put(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ownerId = this.ownerId(request);
    const key = this.keyFromRequest(request);
    const body = request.body;
    let bytes: Uint8Array;
    if (Buffer.isBuffer(body)) {
      bytes = body;
    } else if (body instanceof Uint8Array) {
      bytes = body;
    } else if (typeof body === 'string') {
      bytes = Buffer.from(body, 'utf8');
    } else {
      throw new ValidationError('Body must be raw octets or text');
    }

    await this.objectStorage.put(storageKey(ownerId, key), bytes, {
      contentType:
        typeof request.headers['content-type'] === 'string'
          ? request.headers['content-type']
          : 'application/octet-stream',
      contentLength: bytes.byteLength,
    });

    reply.status(204).send();
  }

  async get(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ownerId = this.ownerId(request);
    const key = this.keyFromRequest(request);
    const obj = await this.objectStorage.get(storageKey(ownerId, key));
    if (!obj) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Object not found' },
      });
      return;
    }
    reply
      .header('Content-Type', obj.metadata?.contentType ?? 'application/octet-stream')
      .header('Content-Length', String(obj.body.byteLength))
      .status(200)
      .send(Buffer.from(obj.body));
  }

  async head(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ownerId = this.ownerId(request);
    const key = this.keyFromRequest(request);
    const obj = await this.objectStorage.get(storageKey(ownerId, key));
    if (!obj) {
      reply.status(404).send();
      return;
    }
    reply
      .header('Content-Type', obj.metadata?.contentType ?? 'application/octet-stream')
      .header('Content-Length', String(obj.metadata?.contentLength ?? obj.body.byteLength))
      .status(200)
      .send();
  }
}

export function createDesktopObjectController(
  objectStorage: IObjectStorage,
): DesktopObjectController {
  return new DesktopObjectController(objectStorage);
}
