import type { FastifyInstance } from 'fastify';
import type { DesktopObjectController } from '../../controllers/desktop-object.controller.js';

/**
 * Desktop Agent folder object sync (ADR-RDA-001 M2 cloud side).
 * Keys are owner-scoped relative paths under `{ownerId}/desktop/...`.
 */
export async function desktopObjectRoutes(
  fastify: FastifyInstance,
  controller: DesktopObjectController,
): Promise<void> {
  // Raw body parsers for this plugin scope only.
  fastify.addContentTypeParser('*', { parseAs: 'buffer' }, (_req, body, done) => {
    done(null, body);
  });

  const opts = {
    schema: {
      tags: ['Desktop Object Sync'],
      security: [{ bearerAuth: [] }],
    },
  };

  fastify.put(
    '/desktop-objects/*',
    {
      ...opts,
      schema: {
        ...opts.schema,
        summary: 'Upload or replace a desktop workspace object',
      },
    },
    controller.put.bind(controller),
  );

  // Fastify auto-registers HEAD for every GET — disable it so our explicit
  // HEAD can avoid downloading the body while answering Content-Length.
  fastify.get(
    '/desktop-objects/*',
    {
      ...opts,
      exposeHeadRoute: false,
      schema: {
        ...opts.schema,
        summary: 'Download a desktop workspace object',
      },
    },
    controller.get.bind(controller),
  );

  fastify.head(
    '/desktop-objects/*',
    {
      ...opts,
      schema: {
        ...opts.schema,
        summary: 'Object metadata (Content-Length)',
      },
    },
    controller.head.bind(controller),
  );
}
