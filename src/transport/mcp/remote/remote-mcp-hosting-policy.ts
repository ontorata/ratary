import type { Env } from '../../../config/env.js';

/**
 * Remote MCP Streamable HTTP keeps sessions in process memory.
 * Production deploys must acknowledge persistent-host requirements (R-CFG-05).
 */
export function assertRemoteMcpHostingPolicy(env: Env): void {
  if (!env.REMOTE_MCP_ENABLED || env.NODE_ENV !== 'production') {
    return;
  }

  if (env.REMOTE_MCP_PERSISTENT_HOST_ACKNOWLEDGED) {
    return;
  }

  throw new Error(
    'REMOTE_MCP_ENABLED in production requires REMOTE_MCP_PERSISTENT_HOST_ACKNOWLEDGED=true ' +
      '(deploy on a persistent host or single instance — not stateless multi-replica serverless without session store).',
  );
}
