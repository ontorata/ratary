# ratary_sdk.DecisionIntelligenceApi

All URIs are relative to *http://localhost:9876/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**fetch_recommendations**](DecisionIntelligenceApi.md#fetch_recommendations) | **POST** /decisions/recommendations | Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042)
[**record_decision_provenance**](DecisionIntelligenceApi.md#record_decision_provenance) | **POST** /decisions/provenance | Record human Accept/Reject provenance (ADR-069, flag-gated)


# **fetch_recommendations**
> FetchRecommendationsResponse fetch_recommendations(fetch_recommendations_request)

Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042)

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.models.fetch_recommendations_request import FetchRecommendationsRequest
from ratary_sdk.models.fetch_recommendations_response import FetchRecommendationsResponse
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
    api_instance = ratary_sdk.DecisionIntelligenceApi(api_client)
    fetch_recommendations_request = ratary_sdk.FetchRecommendationsRequest() # FetchRecommendationsRequest | 

    try:
        # Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042)
        api_response = api_instance.fetch_recommendations(fetch_recommendations_request)
        print("The response of DecisionIntelligenceApi->fetch_recommendations:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DecisionIntelligenceApi->fetch_recommendations: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **fetch_recommendations_request** | [**FetchRecommendationsRequest**](FetchRecommendationsRequest.md)|  | 

### Return type

[**FetchRecommendationsResponse**](FetchRecommendationsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Advisory cards |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **record_decision_provenance**
> RecordDecisionProvenance201Response record_decision_provenance(create_decision_provenance_request)

Record human Accept/Reject provenance (ADR-069, flag-gated)

### Example

* Api Key Authentication (ApiKeyAuth):
* Bearer Authentication (BearerAuth):

```python
import ratary_sdk
from ratary_sdk.models.create_decision_provenance_request import CreateDecisionProvenanceRequest
from ratary_sdk.models.record_decision_provenance201_response import RecordDecisionProvenance201Response
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
    api_instance = ratary_sdk.DecisionIntelligenceApi(api_client)
    create_decision_provenance_request = ratary_sdk.CreateDecisionProvenanceRequest() # CreateDecisionProvenanceRequest | 

    try:
        # Record human Accept/Reject provenance (ADR-069, flag-gated)
        api_response = api_instance.record_decision_provenance(create_decision_provenance_request)
        print("The response of DecisionIntelligenceApi->record_decision_provenance:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DecisionIntelligenceApi->record_decision_provenance: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **create_decision_provenance_request** | [**CreateDecisionProvenanceRequest**](CreateDecisionProvenanceRequest.md)|  | 

### Return type

[**RecordDecisionProvenance201Response**](RecordDecisionProvenance201Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Provenance record |  -  |
**404** | Decision provenance disabled |  -  |
**503** | Provenance store unavailable |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

