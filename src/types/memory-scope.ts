export interface MemoryScope {
  ownerId: string;
}

export function assertMcpOwnerConfigured(): void {
  if (process.env.NODE_ENV === 'production' && !process.env.MCP_OWNER_ID?.trim()) {
    throw new Error('MCP_OWNER_ID is required when NODE_ENV=production');
  }
}

export function getMcpMemoryScope(): MemoryScope {
  assertMcpOwnerConfigured();
  return { ownerId: process.env.MCP_OWNER_ID ?? '' };
}
