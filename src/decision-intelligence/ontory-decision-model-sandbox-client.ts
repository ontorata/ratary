/**
 * PI-P6-D1.1: HTTP client for Ontory decision-model sandbox bridge.
 */

export type OntorySandboxBridgeRequest = Readonly<{
  modelRef: Readonly<{ id: string; version: string }>;
  features: Readonly<Record<string, unknown>>;
}>;

export type OntorySandboxBridgeResponse = Readonly<{
  modelId: string;
  modelVersion: string;
  outcome: string;
  pluginDigest?: string;
  errorMessage?: string;
  output?: Readonly<{
    advisory: true;
    scores: Readonly<Record<string, number>>;
  }>;
}>;

export type OntoryDecisionModelSandboxClientOptions = Readonly<{
  baseUrl: string;
  token: string;
  fetchImpl?: typeof fetch;
}>;

export function isOntorySandboxBridgeEnabled(): boolean {
  return process.env.ONTORY_SANDBOX_BRIDGE_ENABLED === 'true';
}

export function resolveOntorySandboxBridgeConfig():
  Readonly<{ baseUrl: string; token: string }> | undefined {
  if (!isOntorySandboxBridgeEnabled()) return undefined;
  const baseUrl = process.env.ONTORY_RUNTIME_URL?.trim().replace(/\/+$/, '');
  const token = process.env.ONTORY_DECISION_MODEL_SANDBOX_TOKEN?.trim();
  if (!baseUrl || !token) return undefined;
  return Object.freeze({ baseUrl, token });
}

export async function callOntoryDecisionModelSandbox(
  options: OntoryDecisionModelSandboxClientOptions,
  request: OntorySandboxBridgeRequest,
): Promise<OntorySandboxBridgeResponse> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const url = `${options.baseUrl.replace(/\/+$/, '')}/v1/decision-models/sandbox/execute`;
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${options.token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ontory sandbox bridge HTTP ${response.status}: ${text.slice(0, 200)}`);
  }

  return (await response.json()) as OntorySandboxBridgeResponse;
}
