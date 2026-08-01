# \DecisionIntelligenceAPI

All URIs are relative to *http://localhost:9876/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**FetchRecommendations**](DecisionIntelligenceAPI.md#FetchRecommendations) | **Post** /decisions/recommendations | Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042)
[**ListDecisionModels**](DecisionIntelligenceAPI.md#ListDecisionModels) | **Get** /decisions/models | List owner-authorized declarative decision models (PI-P6-D0)
[**RecordDecisionProvenance**](DecisionIntelligenceAPI.md#RecordDecisionProvenance) | **Post** /decisions/provenance | Record human Accept/Reject provenance (ADR-069, flag-gated)



## FetchRecommendations

> FetchRecommendationsResponse FetchRecommendations(ctx).FetchRecommendationsRequest(fetchRecommendationsRequest).Execute()

Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042)

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	fetchRecommendationsRequest := *openapiclient.NewFetchRecommendationsRequest("Query_example") // FetchRecommendationsRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.DecisionIntelligenceAPI.FetchRecommendations(context.Background()).FetchRecommendationsRequest(fetchRecommendationsRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `DecisionIntelligenceAPI.FetchRecommendations``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `FetchRecommendations`: FetchRecommendationsResponse
	fmt.Fprintf(os.Stdout, "Response from `DecisionIntelligenceAPI.FetchRecommendations`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiFetchRecommendationsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **fetchRecommendationsRequest** | [**FetchRecommendationsRequest**](FetchRecommendationsRequest.md) |  | 

### Return type

[**FetchRecommendationsResponse**](FetchRecommendationsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListDecisionModels

> DecisionModelCatalogResponse ListDecisionModels(ctx).Execute()

List owner-authorized declarative decision models (PI-P6-D0)

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.DecisionIntelligenceAPI.ListDecisionModels(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `DecisionIntelligenceAPI.ListDecisionModels``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListDecisionModels`: DecisionModelCatalogResponse
	fmt.Fprintf(os.Stdout, "Response from `DecisionIntelligenceAPI.ListDecisionModels`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiListDecisionModelsRequest struct via the builder pattern


### Return type

[**DecisionModelCatalogResponse**](DecisionModelCatalogResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RecordDecisionProvenance

> RecordDecisionProvenance201Response RecordDecisionProvenance(ctx).CreateDecisionProvenanceRequest(createDecisionProvenanceRequest).Execute()

Record human Accept/Reject provenance (ADR-069, flag-gated)

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	createDecisionProvenanceRequest := *openapiclient.NewCreateDecisionProvenanceRequest("BriefId_example", "Verdict_example") // CreateDecisionProvenanceRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.DecisionIntelligenceAPI.RecordDecisionProvenance(context.Background()).CreateDecisionProvenanceRequest(createDecisionProvenanceRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `DecisionIntelligenceAPI.RecordDecisionProvenance``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RecordDecisionProvenance`: RecordDecisionProvenance201Response
	fmt.Fprintf(os.Stdout, "Response from `DecisionIntelligenceAPI.RecordDecisionProvenance`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiRecordDecisionProvenanceRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createDecisionProvenanceRequest** | [**CreateDecisionProvenanceRequest**](CreateDecisionProvenanceRequest.md) |  | 

### Return type

[**RecordDecisionProvenance201Response**](RecordDecisionProvenance201Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

