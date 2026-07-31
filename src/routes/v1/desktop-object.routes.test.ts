import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { DesktopObjectController } from '../../controllers/desktop-object.controller.js';
import type { IObjectStorage } from '../../ports/storage/iobject-storage.port.js';
import { desktopObjectRoutes } from './desktop-object.routes.js';

describe('desktopObjectRoutes', () => {
  it('registers PUT/GET/HEAD without Fastify HEAD collision', async () => {
    const blobs = new Map<string, Uint8Array>();
    const storage: IObjectStorage = {
      async put(key, body) {
        blobs.set(key.segments.join('/'), typeof body === 'string' ? Buffer.from(body) : body);
      },
      async get(key) {
        const body = blobs.get(key.segments.join('/'));
        return body ? { body, metadata: { contentLength: body.byteLength } } : null;
      },
      async delete() {},
      async exists() {
        return false;
      },
    };

    const app = Fastify();
    app.decorateRequest('user', null);
    app.addHook('onRequest', async (req) => {
      (req as { user?: { ownerId: string } }).user = { ownerId: 'owner-1' };
    });

    await app.register(
      async (f) => {
        await desktopObjectRoutes(f, new DesktopObjectController(storage));
      },
      { prefix: '/api/v1' },
    );
    await app.ready();

    const put = await app.inject({
      method: 'PUT',
      url: '/api/v1/desktop-objects/notes/a.txt',
      payload: Buffer.from('hello'),
      headers: { 'content-type': 'application/octet-stream' },
    });
    expect(put.statusCode).toBe(204);

    const head = await app.inject({
      method: 'HEAD',
      url: '/api/v1/desktop-objects/notes/a.txt',
    });
    expect(head.statusCode).toBe(200);
    expect(head.headers['content-length']).toBe('5');

    const get = await app.inject({
      method: 'GET',
      url: '/api/v1/desktop-objects/notes/a.txt',
    });
    expect(get.statusCode).toBe(200);
    expect(get.body).toBe('hello');

    await app.close();
  });
});
