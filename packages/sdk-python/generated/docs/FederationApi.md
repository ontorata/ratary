# ratary_sdk.FederationApi

All URIs are relative to *http://localhost:3000/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**list_federation_peers**](FederationApi.md#list_federation_peers) | **GET** /federation/peers | 


# **list_federation_peers**
> list_federation_peers()

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000/api/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = ratary_sdk.Configuration(
    host = "http://localhost:3000/api/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: ApiKeyAuth
configuration.api_key['ApiKeyAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['ApiKeyAuth'] = 'Bearer'

# Configure Bearer authorization: BearerAuth
configuration = ratary_sdk.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with ratary_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = ratary_sdk.FederationApi(api_client)

    try:
        api_instance.list_federation_peers()
    except Exception as e:
        print("Exception when calling FederationApi->list_federation_peers: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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
**200** | Peer list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

