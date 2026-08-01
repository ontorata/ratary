# \ContextApi

All URIs are relative to *http://localhost:9876/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**archive_context_package**](ContextApi.md#archive_context_package) | **POST** /context/packages/{packageId}/archive | Archive Context Package (active|retired → archived)
[**build_context**](ContextApi.md#build_context) | **POST** /context | 
[**get_context_package_lifecycle**](ContextApi.md#get_context_package_lifecycle) | **GET** /context/packages/{packageId} | Get Context Package lifecycle state (ADR-1013)
[**retire_context_package**](ContextApi.md#retire_context_package) | **POST** /context/packages/{packageId}/retire | Retire Context Package (active → retired)



## archive_context_package

> models::ContextPackageLifecycle archive_context_package(package_id)
Archive Context Package (active|retired → archived)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**package_id** | **String** |  | [required] |

### Return type

[**models::ContextPackageLifecycle**](ContextPackageLifecycle.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## build_context

> build_context(build_context_request)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**build_context_request** | [**BuildContextRequest**](BuildContextRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_context_package_lifecycle

> models::ContextPackageLifecycle get_context_package_lifecycle(package_id)
Get Context Package lifecycle state (ADR-1013)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**package_id** | **String** |  | [required] |

### Return type

[**models::ContextPackageLifecycle**](ContextPackageLifecycle.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## retire_context_package

> models::ContextPackageLifecycle retire_context_package(package_id)
Retire Context Package (active → retired)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**package_id** | **String** |  | [required] |

### Return type

[**models::ContextPackageLifecycle**](ContextPackageLifecycle.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

