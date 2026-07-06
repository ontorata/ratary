# ratary_sdk.Api.EcosystemApi

All URIs are relative to *http://localhost:3000/api/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**GetEcosystemClient**](EcosystemApi.md#getecosystemclient) | **GET** /ecosystem/clients/{type} |  |
| [**ListEcosystemClients**](EcosystemApi.md#listecosystemclients) | **GET** /ecosystem/clients |  |

<a id="getecosystemclient"></a>
# **GetEcosystemClient**
> void GetEcosystemClient (string type)




### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **type** | **string** |  |  |

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
| **200** | Client profile |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="listecosystemclients"></a>
# **ListEcosystemClients**
> void ListEcosystemClients ()




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
| **200** | Client catalog |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

