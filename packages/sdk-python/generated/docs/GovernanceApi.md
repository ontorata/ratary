# ratary_sdk.GovernanceApi

All URIs are relative to *http://localhost:9876/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_governance_exception_request**](GovernanceApi.md#create_governance_exception_request) | **POST** /governance/exceptions | Create exception request (pending — no auto-approve)
[**get_governance_exception**](GovernanceApi.md#get_governance_exception) | **GET** /governance/exceptions/{exceptionId} | Governance exception request detail
[**get_governance_manifest**](GovernanceApi.md#get_governance_manifest) | **GET** /governance/manifest | Memory governance manifest (ADR-1020 / ADR-1021)
[**get_policy_denial_summary**](GovernanceApi.md#get_policy_denial_summary) | **GET** /governance/denials/summary | Aggregated denial counts by evaluation point
[**get_stewardship_run**](GovernanceApi.md#get_stewardship_run) | **GET** /governance/stewardship/runs/{runId} | Stewardship run detail
[**list_governance_exceptions**](GovernanceApi.md#list_governance_exceptions) | **GET** /governance/exceptions | List governance exception requests (PI-1027-B / ADR-1029)
[**list_policy_denials**](GovernanceApi.md#list_policy_denials) | **GET** /governance/denials | List policy denial events (PI-1027-C / ADR-1028 D4)
[**list_stewardship_runs**](GovernanceApi.md#list_stewardship_runs) | **GET** /governance/stewardship/runs | List stewardship run history for authenticated owner


# **create_governance_exception_request**
> CreateGovernanceExceptionRequest201Response create_governance_exception_request(create_governance_exception_request)

Create exception request (pending — no auto-approve)

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.models.create_governance_exception_request import CreateGovernanceExceptionRequest
from ratary_sdk.models.create_governance_exception_request201_response import CreateGovernanceExceptionRequest201Response
from ratary_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:9876/api/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = ratary_sdk.Configuration(
    host = "http://localhost:9876/api/v1"
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
    api_instance = ratary_sdk.GovernanceApi(api_client)
    create_governance_exception_request = ratary_sdk.CreateGovernanceExceptionRequest() # CreateGovernanceExceptionRequest | 

    try:
        # Create exception request (pending — no auto-approve)
        api_response = api_instance.create_governance_exception_request(create_governance_exception_request)
        print("The response of GovernanceApi->create_governance_exception_request:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling GovernanceApi->create_governance_exception_request: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **create_governance_exception_request** | [**CreateGovernanceExceptionRequest**](CreateGovernanceExceptionRequest.md)|  | 

### Return type

[**CreateGovernanceExceptionRequest201Response**](CreateGovernanceExceptionRequest201Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Created exception request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_governance_exception**
> CreateGovernanceExceptionRequest201Response get_governance_exception(exception_id)

Governance exception request detail

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.models.create_governance_exception_request201_response import CreateGovernanceExceptionRequest201Response
from ratary_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:9876/api/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = ratary_sdk.Configuration(
    host = "http://localhost:9876/api/v1"
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
    api_instance = ratary_sdk.GovernanceApi(api_client)
    exception_id = 'exception_id_example' # str | 

    try:
        # Governance exception request detail
        api_response = api_instance.get_governance_exception(exception_id)
        print("The response of GovernanceApi->get_governance_exception:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling GovernanceApi->get_governance_exception: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **exception_id** | **str**|  | 

### Return type

[**CreateGovernanceExceptionRequest201Response**](CreateGovernanceExceptionRequest201Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Exception detail |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_governance_manifest**
> get_governance_manifest()

Memory governance manifest (ADR-1020 / ADR-1021)

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:9876/api/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = ratary_sdk.Configuration(
    host = "http://localhost:9876/api/v1"
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
    api_instance = ratary_sdk.GovernanceApi(api_client)

    try:
        # Memory governance manifest (ADR-1020 / ADR-1021)
        api_instance.get_governance_manifest()
    except Exception as e:
        print("Exception when calling GovernanceApi->get_governance_manifest: %s\n" % e)
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
**200** | Governance manifest registry |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_policy_denial_summary**
> GetPolicyDenialSummary200Response get_policy_denial_summary(since=since)

Aggregated denial counts by evaluation point

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.models.get_policy_denial_summary200_response import GetPolicyDenialSummary200Response
from ratary_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:9876/api/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = ratary_sdk.Configuration(
    host = "http://localhost:9876/api/v1"
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
    api_instance = ratary_sdk.GovernanceApi(api_client)
    since = '2013-10-20T19:20:30+01:00' # datetime |  (optional)

    try:
        # Aggregated denial counts by evaluation point
        api_response = api_instance.get_policy_denial_summary(since=since)
        print("The response of GovernanceApi->get_policy_denial_summary:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling GovernanceApi->get_policy_denial_summary: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **since** | **datetime**|  | [optional] 

### Return type

[**GetPolicyDenialSummary200Response**](GetPolicyDenialSummary200Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Denial summary |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_stewardship_run**
> get_stewardship_run(run_id)

Stewardship run detail

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:9876/api/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = ratary_sdk.Configuration(
    host = "http://localhost:9876/api/v1"
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
    api_instance = ratary_sdk.GovernanceApi(api_client)
    run_id = 'run_id_example' # str | 

    try:
        # Stewardship run detail
        api_instance.get_stewardship_run(run_id)
    except Exception as e:
        print("Exception when calling GovernanceApi->get_stewardship_run: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **run_id** | **str**|  | 

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
**200** | Stewardship run |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **list_governance_exceptions**
> ListGovernanceExceptions200Response list_governance_exceptions(limit=limit)

List governance exception requests (PI-1027-B / ADR-1029)

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.models.list_governance_exceptions200_response import ListGovernanceExceptions200Response
from ratary_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:9876/api/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = ratary_sdk.Configuration(
    host = "http://localhost:9876/api/v1"
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
    api_instance = ratary_sdk.GovernanceApi(api_client)
    limit = 56 # int |  (optional)

    try:
        # List governance exception requests (PI-1027-B / ADR-1029)
        api_response = api_instance.list_governance_exceptions(limit=limit)
        print("The response of GovernanceApi->list_governance_exceptions:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling GovernanceApi->list_governance_exceptions: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **int**|  | [optional] 

### Return type

[**ListGovernanceExceptions200Response**](ListGovernanceExceptions200Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Exception list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **list_policy_denials**
> ListPolicyDenials200Response list_policy_denials(limit=limit, since=since)

List policy denial events (PI-1027-C / ADR-1028 D4)

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.models.list_policy_denials200_response import ListPolicyDenials200Response
from ratary_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:9876/api/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = ratary_sdk.Configuration(
    host = "http://localhost:9876/api/v1"
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
    api_instance = ratary_sdk.GovernanceApi(api_client)
    limit = 56 # int |  (optional)
    since = '2013-10-20T19:20:30+01:00' # datetime |  (optional)

    try:
        # List policy denial events (PI-1027-C / ADR-1028 D4)
        api_response = api_instance.list_policy_denials(limit=limit, since=since)
        print("The response of GovernanceApi->list_policy_denials:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling GovernanceApi->list_policy_denials: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **int**|  | [optional] 
 **since** | **datetime**|  | [optional] 

### Return type

[**ListPolicyDenials200Response**](ListPolicyDenials200Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Denial events |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **list_stewardship_runs**
> list_stewardship_runs(limit=limit)

List stewardship run history for authenticated owner

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:9876/api/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = ratary_sdk.Configuration(
    host = "http://localhost:9876/api/v1"
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
    api_instance = ratary_sdk.GovernanceApi(api_client)
    limit = 56 # int |  (optional)

    try:
        # List stewardship run history for authenticated owner
        api_instance.list_stewardship_runs(limit=limit)
    except Exception as e:
        print("Exception when calling GovernanceApi->list_stewardship_runs: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **int**|  | [optional] 

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
**200** | Stewardship runs |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

