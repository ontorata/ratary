import { describe, expect, it, vi } from 'vitest';
import { DesktopObjectController } from './desktop-object.controller.js';
import type { IObjectStorage } from '../ports/storage/iobject-storage.port.js';

function mockReply() {
  const headers: Record<string, string> = {};
  const reply = {
    statusCode: 200,
    payload: undefined as unknown,
    header(k: string, v: string) {
      headers[k] = v;
      return reply;
    },
    status(code: number) {
      reply.statusCode = code;
      return reply;
    },
    send(body?: unknown) {
      reply.payload = body;
      return reply;
    },
  };
  return { reply, headers };
}

describe('DesktopObjectController', () => {
  it('puts and gets owner-scoped objects', async () => {
    const blobs = new Map<string, Uint8Array>();
    const storage: IObjectStorage = {
      async put(key, body) {
        const path = key.segments.join('/');
        blobs.set(path, typeof body === 'string' ? Buffer.from(body) : body);
      },
      async get(key) {
        const path = key.segments.join('/');
        const body = blobs.get(path);
        return body ? { body } : null;
      },
      async delete() {},
      async exists(key) {
        return blobs.has(key.segments.join('/'));
      },
    };

    const controller = new DesktopObjectController(storage);
    const putReply = mockReply();
    await controller.put(
      {
        user: { ownerId: 'owner-1' },
        params: { '*': 'notes/a.txt' },
        body: Buffer.from('hello'),
        headers: { 'content-type': 'text/plain' },
      } as never,
      putReply.reply as never,
    );
    expect(putReply.reply.statusCode).toBe(204);
    expect(blobs.has('owner-1/desktop/notes/a.txt')).toBe(true);

    const getReply = mockReply();
    await controller.get(
      {
        user: { ownerId: 'owner-1' },
        params: { '*': 'notes/a.txt' },
        headers: {},
      } as never,
      getReply.reply as never,
    );
    expect(getReply.reply.statusCode).toBe(200);
    expect(Buffer.from(getReply.reply.payload as Buffer).toString()).toBe('hello');
  });

  it('rejects path traversal', async () => {
    const controller = new DesktopObjectController({
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    });
    await expect(
      controller.put(
        {
          user: { ownerId: 'owner-1' },
          params: { '*': '../etc/passwd' },
          body: Buffer.from('x'),
          headers: {},
        } as never,
        mockReply().reply as never,
      ),
    ).rejects.toThrow(/Invalid object key/);
  });
});
