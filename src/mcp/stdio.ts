import { startMcpStdioServer } from './server.js';

startMcpStdioServer().catch((error) => {
  console.error('MCP server failed to start:', error);
  process.exit(1);
});
