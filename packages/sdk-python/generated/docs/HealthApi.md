# ratary_sdk.HealthApi

All URIs are relative to *http://localhost:3000/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_health**](HealthApi.md#get_health) | **GET** /health | 


# **get_health**
> get_health()

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
    api_instance = ratary_sdk.HealthApi(api_client)

    try:
        api_instance.get_health()
    except Exception as e:
        print("Exception when calling HealthApi->get_health: %s\n" % e)
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
**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

