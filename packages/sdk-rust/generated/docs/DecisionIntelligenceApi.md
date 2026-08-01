# \DecisionIntelligenceApi

All URIs are relative to *http://localhost:9876/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**fetch_recommendations**](DecisionIntelligenceApi.md#fetch_recommendations) | **POST** /decisions/recommendations | Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042)
[**list_decision_models**](DecisionIntelligenceApi.md#list_decision_models) | **GET** /decisions/models | List owner-authorized declarative decision models (PI-P6-D0)
[**record_decision_provenance**](DecisionIntelligenceApi.md#record_decision_provenance) | **POST** /decisions/provenance | Record human Accept/Reject provenance (ADR-069, flag-gated)



## fetch_recommendations

> models::FetchRecommendationsResponse fetch_recommendations(fetch_recommendations_request)
Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**fetch_recommendations_request** | [**FetchRecommendationsRequest**](FetchRecommendationsRequest.md) |  | [required] |

### Return type

[**models::FetchRecommendationsResponse**](FetchRecommendationsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## list_decision_models

> models::DecisionModelCatalogResponse list_decision_models()
List owner-authorized declarative decision models (PI-P6-D0)

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::DecisionModelCatalogResponse**](DecisionModelCatalogResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## record_decision_provenance

> models::RecordDecisionProvenance201Response record_decision_provenance(create_decision_provenance_request)
Record human Accept/Reject provenance (ADR-069, flag-gated)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**create_decision_provenance_request** | [**CreateDecisionProvenanceRequest**](CreateDecisionProvenanceRequest.md) |  | [required] |

### Return type

[**models::RecordDecisionProvenance201Response**](recordDecisionProvenance_201_response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

