import type { IApiClient } from '../ports/iapi-client.js';
import type {
  CreateGovernanceExceptionInput,
  GovernanceExceptionRecord,
  PolicyDenialEvent,
  PolicyDenialSummary,
} from '../types.js';

export class GovernanceApi {
  constructor(private readonly client: IApiClient) {}

  async getManifest(): Promise<Record<string, unknown>> {
    return this.client.request({ method: 'GET', path: '/governance/manifest' });
  }

  async listStewardshipRuns(params?: { limit?: number }): Promise<{ runs: unknown[] }> {
    return this.client.request({
      method: 'GET',
      path: '/governance/stewardship/runs',
      query: params,
    });
  }

  async getStewardshipRun(runId: string): Promise<{ run: unknown }> {
    return this.client.request({ method: 'GET', path: `/governance/stewardship/runs/${runId}` });
  }

  async listExceptions(params?: {
    limit?: number;
  }): Promise<{ exceptions: GovernanceExceptionRecord[] }> {
    return this.client.request({
      method: 'GET',
      path: '/governance/exceptions',
      query: params,
    });
  }

  async getException(exceptionId: string): Promise<{ exception: GovernanceExceptionRecord }> {
    return this.client.request({ method: 'GET', path: `/governance/exceptions/${exceptionId}` });
  }

  async createExceptionRequest(
    input: CreateGovernanceExceptionInput,
  ): Promise<{ exception: GovernanceExceptionRecord }> {
    return this.client.request({
      method: 'POST',
      path: '/governance/exceptions',
      body: input,
    });
  }

  async listDenials(params?: {
    limit?: number;
    since?: string;
  }): Promise<{ denials: PolicyDenialEvent[] }> {
    return this.client.request({
      method: 'GET',
      path: '/governance/denials',
      query: params,
    });
  }

  async getDenialSummary(params?: { since?: string }): Promise<{ summary: PolicyDenialSummary }> {
    return this.client.request({
      method: 'GET',
      path: '/governance/denials/summary',
      query: params,
    });
  }
}
