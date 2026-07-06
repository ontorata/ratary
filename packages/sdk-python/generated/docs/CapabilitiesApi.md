# ratary_sdk.CapabilitiesApi

All URIs are relative to *http://localhost:3000/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_capabilities**](CapabilitiesApi.md#get_capabilities) | **GET** /capabilities | 
[**negotiate_capabilities**](CapabilitiesApi.md#negotiate_capabilities) | **POST** /capabilities/negotiate | 


# **get_capabilities**
> get_capabilities()

### Example


```python
import ratary_sdk
from ratary_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000/api/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = ratary_sdk.Configuration(
    host = "http://localhost:3000/api/v1"
)


# Enter a context with an instance of the API client
with ratary_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = ratary_sdk.CapabilitiesApi(api_client)

    try:
        api_instance.get_capabilities()
    except Exception as e:
        print("Exception when calling CapabilitiesApi->get_capabilities: %s\n" % e)
```



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
**200** | Capability manifest |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **negotiate_capabilities**
> CapabilityNegotiationResult negotiate_capabilities(client_capability_request=client_capability_request)

### Example


```python
import ratary_sdk
from ratary_sdk.models.capability_negotiation_result import CapabilityNegotiationResult
from ratary_sdk.models.client_capability_request import ClientCapabilityRequest
from ratary_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000/api/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = ratary_sdk.Configuration(
    host = "http://localhost:3000/api/v1"
)


# Enter a context with an instance of the API client
with ratary_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = ratary_sdk.CapabilitiesApi(api_client)
    client_capability_request = ratary_sdk.ClientCapabilityRequest() # ClientCapabilityRequest |  (optional)

    try:
        api_response = api_instance.negotiate_capabilities(client_capability_request=client_capability_request)
        print("The response of CapabilitiesApi->negotiate_capabilities:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CapabilitiesApi->negotiate_capabilities: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **client_capability_request** | [**ClientCapabilityRequest**](ClientCapabilityRequest.md)|  | [optional] 

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
**200** | Negotiation result matrix |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

