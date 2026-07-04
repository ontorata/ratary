import type { ITransportServer, TransportHealth } from '../registry/itransport-server.interface.js';
import { startMcpStdioServer } from './mcp-server.js';

/**
 * MCP stdio transport server (ADR-027 Phase 10.5D) — wraps the stdio bootstrap
 * in the ITransportServer lifecycle. stdio has no port to close; stop() is a
 * process-lifetime no-op preserved for registry symmetry.
 */
export class McpTransportServer implements ITransportServer {
  readonly protocol = 'mcp-stdio' as const;
  private connected = false;

  async start(): Promise<void> {
    if (this.connected) return;
    await startMcpStdioServer();
    this.connected = true;
  }

  async stop(): Promise<void> {
    this.connected = false;
  }

  health(): TransportHealth {
    return { status: this.connected ? 'ok' : 'down', details: { transport: 'stdio' } };
  }
}
