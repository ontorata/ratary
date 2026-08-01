# \ContextAPI

All URIs are relative to *http://localhost:9876/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ArchiveContextPackage**](ContextAPI.md#ArchiveContextPackage) | **Post** /context/packages/{packageId}/archive | Archive Context Package (active|retired → archived)
[**BuildContext**](ContextAPI.md#BuildContext) | **Post** /context | 
[**GetContextPackageLifecycle**](ContextAPI.md#GetContextPackageLifecycle) | **Get** /context/packages/{packageId} | Get Context Package lifecycle state (ADR-1013)
[**RetireContextPackage**](ContextAPI.md#RetireContextPackage) | **Post** /context/packages/{packageId}/retire | Retire Context Package (active → retired)



## ArchiveContextPackage

> ContextPackageLifecycle ArchiveContextPackage(ctx, packageId).Execute()

Archive Context Package (active|retired → archived)

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
	packageId := "packageId_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.ContextAPI.ArchiveContextPackage(context.Background(), packageId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `ContextAPI.ArchiveContextPackage``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ArchiveContextPackage`: ContextPackageLifecycle
	fmt.Fprintf(os.Stdout, "Response from `ContextAPI.ArchiveContextPackage`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**packageId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiArchiveContextPackageRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**ContextPackageLifecycle**](ContextPackageLifecycle.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## BuildContext

> BuildContext(ctx).BuildContextRequest(buildContextRequest).Execute()



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
	buildContextRequest := *openapiclient.NewBuildContextRequest("Task_example") // BuildContextRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.ContextAPI.BuildContext(context.Background()).BuildContextRequest(buildContextRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `ContextAPI.BuildContext``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiBuildContextRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **buildContextRequest** | [**BuildContextRequest**](BuildContextRequest.md) |  | 

### Return type

 (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetContextPackageLifecycle

> ContextPackageLifecycle GetContextPackageLifecycle(ctx, packageId).Execute()

Get Context Package lifecycle state (ADR-1013)

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
	packageId := "packageId_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.ContextAPI.GetContextPackageLifecycle(context.Background(), packageId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `ContextAPI.GetContextPackageLifecycle``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetContextPackageLifecycle`: ContextPackageLifecycle
	fmt.Fprintf(os.Stdout, "Response from `ContextAPI.GetContextPackageLifecycle`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**packageId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetContextPackageLifecycleRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**ContextPackageLifecycle**](ContextPackageLifecycle.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RetireContextPackage

> ContextPackageLifecycle RetireContextPackage(ctx, packageId).Execute()

Retire Context Package (active → retired)

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
	packageId := "packageId_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.ContextAPI.RetireContextPackage(context.Background(), packageId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `ContextAPI.RetireContextPackage``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RetireContextPackage`: ContextPackageLifecycle
	fmt.Fprintf(os.Stdout, "Response from `ContextAPI.RetireContextPackage`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**packageId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiRetireContextPackageRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**ContextPackageLifecycle**](ContextPackageLifecycle.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

