# \GovernanceAPI

All URIs are relative to *http://localhost:9876/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateGovernanceExceptionRequest**](GovernanceAPI.md#CreateGovernanceExceptionRequest) | **Post** /governance/exceptions | Create exception request (pending — no auto-approve)
[**GetGovernanceException**](GovernanceAPI.md#GetGovernanceException) | **Get** /governance/exceptions/{exceptionId} | Governance exception request detail
[**GetGovernanceManifest**](GovernanceAPI.md#GetGovernanceManifest) | **Get** /governance/manifest | Memory governance manifest (ADR-1020 / ADR-1021)
[**GetPolicyDenialSummary**](GovernanceAPI.md#GetPolicyDenialSummary) | **Get** /governance/denials/summary | Aggregated denial counts by evaluation point
[**GetStewardshipRun**](GovernanceAPI.md#GetStewardshipRun) | **Get** /governance/stewardship/runs/{runId} | Stewardship run detail
[**ListGovernanceExceptions**](GovernanceAPI.md#ListGovernanceExceptions) | **Get** /governance/exceptions | List governance exception requests (PI-1027-B / ADR-1029)
[**ListPolicyDenials**](GovernanceAPI.md#ListPolicyDenials) | **Get** /governance/denials | List policy denial events (PI-1027-C / ADR-1028 D4)
[**ListStewardshipRuns**](GovernanceAPI.md#ListStewardshipRuns) | **Get** /governance/stewardship/runs | List stewardship run history for authenticated owner



## CreateGovernanceExceptionRequest

> CreateGovernanceExceptionRequest201Response CreateGovernanceExceptionRequest(ctx).CreateGovernanceExceptionRequest(createGovernanceExceptionRequest).Execute()

Create exception request (pending — no auto-approve)

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
	createGovernanceExceptionRequest := *openapiclient.NewCreateGovernanceExceptionRequest("ExceptionClass_example", "Rationale_example") // CreateGovernanceExceptionRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.GovernanceAPI.CreateGovernanceExceptionRequest(context.Background()).CreateGovernanceExceptionRequest(createGovernanceExceptionRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `GovernanceAPI.CreateGovernanceExceptionRequest``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateGovernanceExceptionRequest`: CreateGovernanceExceptionRequest201Response
	fmt.Fprintf(os.Stdout, "Response from `GovernanceAPI.CreateGovernanceExceptionRequest`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateGovernanceExceptionRequestRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createGovernanceExceptionRequest** | [**CreateGovernanceExceptionRequest**](CreateGovernanceExceptionRequest.md) |  | 

### Return type

[**CreateGovernanceExceptionRequest201Response**](CreateGovernanceExceptionRequest201Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetGovernanceException

> CreateGovernanceExceptionRequest201Response GetGovernanceException(ctx, exceptionId).Execute()

Governance exception request detail

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
	exceptionId := "exceptionId_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.GovernanceAPI.GetGovernanceException(context.Background(), exceptionId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `GovernanceAPI.GetGovernanceException``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetGovernanceException`: CreateGovernanceExceptionRequest201Response
	fmt.Fprintf(os.Stdout, "Response from `GovernanceAPI.GetGovernanceException`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**exceptionId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetGovernanceExceptionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**CreateGovernanceExceptionRequest201Response**](CreateGovernanceExceptionRequest201Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetGovernanceManifest

> GetGovernanceManifest(ctx).Execute()

Memory governance manifest (ADR-1020 / ADR-1021)

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
	r, err := apiClient.GovernanceAPI.GetGovernanceManifest(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `GovernanceAPI.GetGovernanceManifest``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetGovernanceManifestRequest struct via the builder pattern


### Return type

 (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetPolicyDenialSummary

> GetPolicyDenialSummary200Response GetPolicyDenialSummary(ctx).Since(since).Execute()

Aggregated denial counts by evaluation point

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
    "time"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	since := time.Now() // time.Time |  (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.GovernanceAPI.GetPolicyDenialSummary(context.Background()).Since(since).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `GovernanceAPI.GetPolicyDenialSummary``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetPolicyDenialSummary`: GetPolicyDenialSummary200Response
	fmt.Fprintf(os.Stdout, "Response from `GovernanceAPI.GetPolicyDenialSummary`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGetPolicyDenialSummaryRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **since** | **time.Time** |  | 

### Return type

[**GetPolicyDenialSummary200Response**](GetPolicyDenialSummary200Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetStewardshipRun

> GetStewardshipRun(ctx, runId).Execute()

Stewardship run detail

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
	runId := "runId_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.GovernanceAPI.GetStewardshipRun(context.Background(), runId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `GovernanceAPI.GetStewardshipRun``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**runId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetStewardshipRunRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

 (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListGovernanceExceptions

> ListGovernanceExceptions200Response ListGovernanceExceptions(ctx).Limit(limit).Execute()

List governance exception requests (PI-1027-B / ADR-1029)

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
	limit := int32(56) // int32 |  (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.GovernanceAPI.ListGovernanceExceptions(context.Background()).Limit(limit).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `GovernanceAPI.ListGovernanceExceptions``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListGovernanceExceptions`: ListGovernanceExceptions200Response
	fmt.Fprintf(os.Stdout, "Response from `GovernanceAPI.ListGovernanceExceptions`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiListGovernanceExceptionsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **int32** |  | 

### Return type

[**ListGovernanceExceptions200Response**](ListGovernanceExceptions200Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListPolicyDenials

> ListPolicyDenials200Response ListPolicyDenials(ctx).Limit(limit).Since(since).Execute()

List policy denial events (PI-1027-C / ADR-1028 D4)

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
    "time"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	limit := int32(56) // int32 |  (optional)
	since := time.Now() // time.Time |  (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.GovernanceAPI.ListPolicyDenials(context.Background()).Limit(limit).Since(since).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `GovernanceAPI.ListPolicyDenials``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListPolicyDenials`: ListPolicyDenials200Response
	fmt.Fprintf(os.Stdout, "Response from `GovernanceAPI.ListPolicyDenials`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiListPolicyDenialsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **int32** |  | 
 **since** | **time.Time** |  | 

### Return type

[**ListPolicyDenials200Response**](ListPolicyDenials200Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListStewardshipRuns

> ListStewardshipRuns(ctx).Limit(limit).Execute()

List stewardship run history for authenticated owner

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
	limit := int32(56) // int32 |  (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.GovernanceAPI.ListStewardshipRuns(context.Background()).Limit(limit).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `GovernanceAPI.ListStewardshipRuns``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiListStewardshipRunsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **int32** |  | 

### Return type

 (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

