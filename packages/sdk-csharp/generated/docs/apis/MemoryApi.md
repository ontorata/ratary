# ratary_sdk.Api.MemoryApi

All URIs are relative to *http://localhost:9876/api/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**CreateMemory**](MemoryApi.md#creatememory) | **POST** /memory |  |
| [**DeleteMemory**](MemoryApi.md#deletememory) | **DELETE** /memory/{id} |  |
| [**GetMemory**](MemoryApi.md#getmemory) | **GET** /memory/{id} |  |
| [**ListMemories**](MemoryApi.md#listmemories) | **GET** /memory |  |
| [**UpdateMemory**](MemoryApi.md#updatememory) | **PUT** /memory/{id} |  |

<a id="creatememory"></a>
# **CreateMemory**
> void CreateMemory (CreateMemoryRequest createMemoryRequest)




### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **createMemoryRequest** | [**CreateMemoryRequest**](CreateMemoryRequest.md) |  |  |

### Return type

void (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Created memory |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="deletememory"></a>
# **DeleteMemory**
> void DeleteMemory (Guid id)




### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

void (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Deleted |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="getmemory"></a>
# **GetMemory**
> void GetMemory (Guid id)




### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

void (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Memory |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="listmemories"></a>
# **ListMemories**
> void ListMemories (string project = null, int limit = null, int offset = null)




### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **project** | **string** |  | [optional]  |
| **limit** | **int** |  | [optional]  |
| **offset** | **int** |  | [optional]  |

### Return type

void (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Memory list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="updatememory"></a>
# **UpdateMemory**
> void UpdateMemory (Guid id, UpdateMemoryRequest updateMemoryRequest = null)




### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **updateMemoryRequest** | [**UpdateMemoryRequest**](UpdateMemoryRequest.md) |  | [optional]  |

### Return type

void (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Updated memory |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

