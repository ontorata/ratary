# ratary_sdk.Api.ContextApi

All URIs are relative to *http://localhost:9876/api/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**ArchiveContextPackage**](ContextApi.md#archivecontextpackage) | **POST** /context/packages/{packageId}/archive | Archive Context Package (active|retired → archived) |
| [**BuildContext**](ContextApi.md#buildcontext) | **POST** /context |  |
| [**GetContextPackageLifecycle**](ContextApi.md#getcontextpackagelifecycle) | **GET** /context/packages/{packageId} | Get Context Package lifecycle state (ADR-1013) |
| [**RetireContextPackage**](ContextApi.md#retirecontextpackage) | **POST** /context/packages/{packageId}/retire | Retire Context Package (active → retired) |

<a id="archivecontextpackage"></a>
# **ArchiveContextPackage**
> ContextPackageLifecycle ArchiveContextPackage (string packageId)

Archive Context Package (active|retired → archived)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **packageId** | **string** |  |  |

### Return type

[**ContextPackageLifecycle**](ContextPackageLifecycle.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Updated lifecycle record |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="buildcontext"></a>
# **BuildContext**
> void BuildContext (BuildContextRequest buildContextRequest)




### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **buildContextRequest** | [**BuildContextRequest**](BuildContextRequest.md) |  |  |

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
| **200** | Context bundle |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="getcontextpackagelifecycle"></a>
# **GetContextPackageLifecycle**
> ContextPackageLifecycle GetContextPackageLifecycle (string packageId)

Get Context Package lifecycle state (ADR-1013)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **packageId** | **string** |  |  |

### Return type

[**ContextPackageLifecycle**](ContextPackageLifecycle.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Lifecycle record |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="retirecontextpackage"></a>
# **RetireContextPackage**
> ContextPackageLifecycle RetireContextPackage (string packageId)

Retire Context Package (active → retired)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **packageId** | **string** |  |  |

### Return type

[**ContextPackageLifecycle**](ContextPackageLifecycle.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Updated lifecycle record |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

