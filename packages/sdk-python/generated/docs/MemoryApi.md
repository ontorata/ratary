# ratary_sdk.MemoryApi

All URIs are relative to *http://localhost:3000/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_memory**](MemoryApi.md#create_memory) | **POST** /memory | 
[**delete_memory**](MemoryApi.md#delete_memory) | **DELETE** /memory/{id} | 
[**get_memory**](MemoryApi.md#get_memory) | **GET** /memory/{id} | 
[**list_memories**](MemoryApi.md#list_memories) | **GET** /memory | 
[**update_memory**](MemoryApi.md#update_memory) | **PUT** /memory/{id} | 


# **create_memory**
> create_memory(create_memory_request)

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.models.create_memory_request import CreateMemoryRequest
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
    api_instance = ratary_sdk.MemoryApi(api_client)
    create_memory_request = ratary_sdk.CreateMemoryRequest() # CreateMemoryRequest | 

    try:
        api_instance.create_memory(create_memory_request)
    except Exception as e:
        print("Exception when calling MemoryApi->create_memory: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **create_memory_request** | [**CreateMemoryRequest**](CreateMemoryRequest.md)|  | 

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
**201** | Created memory |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete_memory**
> delete_memory(id)

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
    api_instance = ratary_sdk.MemoryApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        api_instance.delete_memory(id)
    except Exception as e:
        print("Exception when calling MemoryApi->delete_memory: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 

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
**204** | Deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_memory**
> get_memory(id)

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
    api_instance = ratary_sdk.MemoryApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        api_instance.get_memory(id)
    except Exception as e:
        print("Exception when calling MemoryApi->get_memory: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 

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
**200** | Memory |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **list_memories**
> list_memories(project=project, limit=limit, offset=offset)

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
    api_instance = ratary_sdk.MemoryApi(api_client)
    project = 'project_example' # str |  (optional)
    limit = 56 # int |  (optional)
    offset = 56 # int |  (optional)

    try:
        api_instance.list_memories(project=project, limit=limit, offset=offset)
    except Exception as e:
        print("Exception when calling MemoryApi->list_memories: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project** | **str**|  | [optional] 
 **limit** | **int**|  | [optional] 
 **offset** | **int**|  | [optional] 

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
**200** | Memory list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **update_memory**
> update_memory(id, update_memory_request=update_memory_request)

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.models.update_memory_request import UpdateMemoryRequest
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
    api_instance = ratary_sdk.MemoryApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    update_memory_request = ratary_sdk.UpdateMemoryRequest() # UpdateMemoryRequest |  (optional)

    try:
        api_instance.update_memory(id, update_memory_request=update_memory_request)
    except Exception as e:
        print("Exception when calling MemoryApi->update_memory: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **update_memory_request** | [**UpdateMemoryRequest**](UpdateMemoryRequest.md)|  | [optional] 

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
**200** | Updated memory |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

