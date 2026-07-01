export interface MemoryScope {
  ownerId: string;
}

export function getMcpMemoryScope(): MemoryScope {
  return { ownerId: process.env.MCP_OWNER_ID ?? '' };
}
