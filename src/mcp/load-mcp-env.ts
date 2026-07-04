import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Load repo-root `.env` before MCP bootstrap.
 * Uses override so host-injected vars (e.g. Cursor setting NODE_ENV=production)
 * do not block local solo dev when `.env` has NODE_ENV=development.
 */
config({ path: resolve(projectRoot, '.env'), override: true, quiet: true });
