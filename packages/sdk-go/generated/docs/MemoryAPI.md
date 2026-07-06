# \MemoryAPI

All URIs are relative to *http://localhost:3000/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateMemory**](MemoryAPI.md#CreateMemory) | **Post** /memory | 
[**DeleteMemory**](MemoryAPI.md#DeleteMemory) | **Delete** /memory/{id} | 
[**GetMemory**](MemoryAPI.md#GetMemory) | **Get** /memory/{id} | 
[**ListMemories**](MemoryAPI.md#ListMemories) | **Get** /memory | 
[**UpdateMemory**](MemoryAPI.md#UpdateMemory) | **Put** /memory/{id} | 



## CreateMemory

> CreateMemory(ctx).CreateMemoryRequest(createMemoryRequest).Execute()



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
	createMemoryRequest := *openapiclient.NewCreateMemoryRequest("Title_example", "Content_example") // CreateMemoryRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.MemoryAPI.CreateMemory(context.Background()).CreateMemoryRequest(createMemoryRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `MemoryAPI.CreateMemory``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateMemoryRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createMemoryRequest** | [**CreateMemoryRequest**](CreateMemoryRequest.md) |  | 

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


## DeleteMemory

> DeleteMemory(ctx, id).Execute()



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
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.MemoryAPI.DeleteMemory(context.Background(), id).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `MemoryAPI.DeleteMemory``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiDeleteMemoryRequest struct via the builder pattern


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


## GetMemory

> GetMemory(ctx, id).Execute()



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
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.MemoryAPI.GetMemory(context.Background(), id).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `MemoryAPI.GetMemory``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetMemoryRequest struct via the builder pattern


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


## ListMemories

> ListMemories(ctx).Project(project).Limit(limit).Offset(offset).Execute()



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
	project := "project_example" // string |  (optional)
	limit := int32(56) // int32 |  (optional)
	offset := int32(56) // int32 |  (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.MemoryAPI.ListMemories(context.Background()).Project(project).Limit(limit).Offset(offset).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `MemoryAPI.ListMemories``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiListMemoriesRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project** | **string** |  | 
 **limit** | **int32** |  | 
 **offset** | **int32** |  | 

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


## UpdateMemory

> UpdateMemory(ctx, id).UpdateMemoryRequest(updateMemoryRequest).Execute()



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
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	updateMemoryRequest := *openapiclient.NewUpdateMemoryRequest() // UpdateMemoryRequest |  (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.MemoryAPI.UpdateMemory(context.Background(), id).UpdateMemoryRequest(updateMemoryRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `MemoryAPI.UpdateMemory``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiUpdateMemoryRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **updateMemoryRequest** | [**UpdateMemoryRequest**](UpdateMemoryRequest.md) |  | 

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

