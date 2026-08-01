# ratary_sdk.Api.DecisionIntelligenceApi

All URIs are relative to *http://localhost:9876/api/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**FetchRecommendations**](DecisionIntelligenceApi.md#fetchrecommendations) | **POST** /decisions/recommendations | Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042) |
| [**ListDecisionModels**](DecisionIntelligenceApi.md#listdecisionmodels) | **GET** /decisions/models | List owner-authorized declarative decision models (PI-P6-D0) |
| [**RecordDecisionProvenance**](DecisionIntelligenceApi.md#recorddecisionprovenance) | **POST** /decisions/provenance | Record human Accept/Reject provenance (ADR-069, flag-gated) |

<a id="fetchrecommendations"></a>
# **FetchRecommendations**
> FetchRecommendationsResponse FetchRecommendations (FetchRecommendationsRequest fetchRecommendationsRequest)

Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **fetchRecommendationsRequest** | [**FetchRecommendationsRequest**](FetchRecommendationsRequest.md) |  |  |

### Return type

[**FetchRecommendationsResponse**](FetchRecommendationsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Advisory cards |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="listdecisionmodels"></a>
# **ListDecisionModels**
> DecisionModelCatalogResponse ListDecisionModels ()

List owner-authorized declarative decision models (PI-P6-D0)


### Parameters
This endpoint does not need any parameter.
### Return type

[**DecisionModelCatalogResponse**](DecisionModelCatalogResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Authorized decision model catalog |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="recorddecisionprovenance"></a>
# **RecordDecisionProvenance**
> RecordDecisionProvenance201Response RecordDecisionProvenance (CreateDecisionProvenanceRequest createDecisionProvenanceRequest)

Record human Accept/Reject provenance (ADR-069, flag-gated)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **createDecisionProvenanceRequest** | [**CreateDecisionProvenanceRequest**](CreateDecisionProvenanceRequest.md) |  |  |

### Return type

[**RecordDecisionProvenance201Response**](RecordDecisionProvenance201Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Provenance record |  -  |
| **404** | Decision provenance disabled |  -  |
| **503** | Provenance store unavailable |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

