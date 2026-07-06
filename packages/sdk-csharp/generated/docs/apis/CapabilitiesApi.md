# ratary_sdk.Api.CapabilitiesApi

All URIs are relative to *http://localhost:3000/api/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**GetCapabilities**](CapabilitiesApi.md#getcapabilities) | **GET** /capabilities |  |
| [**NegotiateCapabilities**](CapabilitiesApi.md#negotiatecapabilities) | **POST** /capabilities/negotiate |  |

<a id="getcapabilities"></a>
# **GetCapabilities**
> void GetCapabilities ()




### Parameters
This endpoint does not need any parameter.
### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Capability manifest |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="negotiatecapabilities"></a>
# **NegotiateCapabilities**
> CapabilityNegotiationResult NegotiateCapabilities (ClientCapabilityRequest clientCapabilityRequest = null)




### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **clientCapabilityRequest** | [**ClientCapabilityRequest**](ClientCapabilityRequest.md) |  | [optional]  |

### Return type

[**CapabilityNegotiationResult**](CapabilityNegotiationResult.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Negotiation result matrix |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

