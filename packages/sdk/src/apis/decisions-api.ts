import type { IApiClient } from '../ports/iapi-client.js';
import type {
  CreateDecisionProvenanceInput,
  DecisionModelCatalogResponse,
  DecisionProvenanceRecord,
  FetchRecommendationsInput,
  FetchRecommendationsResult,
} from '../types.js';

export class DecisionsApi {
  constructor(private readonly client: IApiClient) {}

  async listModels(): Promise<DecisionModelCatalogResponse> {
    return this.client.request({
      method: 'GET',
      path: '/decisions/models',
    });
  }

  async fetchRecommendations(
    input: FetchRecommendationsInput,
  ): Promise<FetchRecommendationsResult> {
    return this.client.request({
      method: 'POST',
      path: '/decisions/recommendations',
      body: input,
    });
  }

  async recordProvenance(
    input: CreateDecisionProvenanceInput,
  ): Promise<{ record: DecisionProvenanceRecord }> {
    return this.client.request({
      method: 'POST',
      path: '/decisions/provenance',
      body: input,
    });
  }
}
