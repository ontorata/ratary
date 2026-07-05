/** Ratary client env with legacy AI_BRAIN_* fallback after rebrand. */
export function rataryEnv(primary: string, legacy?: string): string | undefined {
  const value = process.env[primary]?.trim();
  if (value) return value;
  if (legacy) {
    const fallback = process.env[legacy]?.trim();
    if (fallback) return fallback;
  }
  return undefined;
}

export function resolveRataryClientConfig(): {
  baseUrl: string;
  apiKey: string | undefined;
  workspaceId: string | undefined;
} {
  return {
    baseUrl: rataryEnv('RATARY_BASE_URL', 'AI_BRAIN_BASE_URL') ?? 'http://localhost:3000',
    apiKey: rataryEnv('RATARY_API_KEY', 'AI_BRAIN_API_KEY') ?? process.env.API_KEY?.trim(),
    workspaceId: rataryEnv('RATARY_WORKSPACE_ID', 'AI_BRAIN_WORKSPACE_ID'),
  };
}
