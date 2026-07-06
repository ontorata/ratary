# \CapabilitiesApi

All URIs are relative to *http://localhost:9876/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_capabilities**](CapabilitiesApi.md#get_capabilities) | **GET** /capabilities | 
[**negotiate_capabilities**](CapabilitiesApi.md#negotiate_capabilities) | **POST** /capabilities/negotiate | 



## get_capabilities

> get_capabilities()


### Parameters

This endpoint does not need any parameter.

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## negotiate_capabilities

> models::CapabilityNegotiationResult negotiate_capabilities(client_capability_request)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**client_capability_request** | Option<[**ClientCapabilityRequest**](ClientCapabilityRequest.md)> |  |  |

### Return type

[**models::CapabilityNegotiationResult**](CapabilityNegotiationResult.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

