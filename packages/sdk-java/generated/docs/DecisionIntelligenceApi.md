# DecisionIntelligenceApi

All URIs are relative to *http://localhost:9876/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**fetchRecommendations**](DecisionIntelligenceApi.md#fetchRecommendations) | **POST** /decisions/recommendations | Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042) |
| [**listDecisionModels**](DecisionIntelligenceApi.md#listDecisionModels) | **GET** /decisions/models | List owner-authorized declarative decision models (PI-P6-D0) |
| [**recordDecisionProvenance**](DecisionIntelligenceApi.md#recordDecisionProvenance) | **POST** /decisions/provenance | Record human Accept/Reject provenance (ADR-069, flag-gated) |


<a id="fetchRecommendations"></a>
# **fetchRecommendations**
> FetchRecommendationsResponse fetchRecommendations(fetchRecommendationsRequest)

Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.DecisionIntelligenceApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:9876/api/v1");
    
    // Configure API key authorization: ApiKeyAuth
    ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
    ApiKeyAuth.setApiKey("YOUR API KEY");
    // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
    //ApiKeyAuth.setApiKeyPrefix("Token");

    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    DecisionIntelligenceApi apiInstance = new DecisionIntelligenceApi(defaultClient);
    FetchRecommendationsRequest fetchRecommendationsRequest = new FetchRecommendationsRequest(); // FetchRecommendationsRequest | 
    try {
      FetchRecommendationsResponse result = apiInstance.fetchRecommendations(fetchRecommendationsRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling DecisionIntelligenceApi#fetchRecommendations");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters

| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **fetchRecommendationsRequest** | [**FetchRecommendationsRequest**](FetchRecommendationsRequest.md)|  | |

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
| **200** | Advisory cards |  -  |

<a id="listDecisionModels"></a>
# **listDecisionModels**
> DecisionModelCatalogResponse listDecisionModels()

List owner-authorized declarative decision models (PI-P6-D0)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.DecisionIntelligenceApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:9876/api/v1");
    
    // Configure API key authorization: ApiKeyAuth
    ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
    ApiKeyAuth.setApiKey("YOUR API KEY");
    // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
    //ApiKeyAuth.setApiKeyPrefix("Token");

    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    DecisionIntelligenceApi apiInstance = new DecisionIntelligenceApi(defaultClient);
    try {
      DecisionModelCatalogResponse result = apiInstance.listDecisionModels();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling DecisionIntelligenceApi#listDecisionModels");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**DecisionModelCatalogResponse**](DecisionModelCatalogResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Authorized decision model catalog |  -  |
| **401** | Unauthorized |  -  |

<a id="recordDecisionProvenance"></a>
# **recordDecisionProvenance**
> RecordDecisionProvenance201Response recordDecisionProvenance(createDecisionProvenanceRequest)

Record human Accept/Reject provenance (ADR-069, flag-gated)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.DecisionIntelligenceApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:9876/api/v1");
    
    // Configure API key authorization: ApiKeyAuth
    ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
    ApiKeyAuth.setApiKey("YOUR API KEY");
    // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
    //ApiKeyAuth.setApiKeyPrefix("Token");

    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    DecisionIntelligenceApi apiInstance = new DecisionIntelligenceApi(defaultClient);
    CreateDecisionProvenanceRequest createDecisionProvenanceRequest = new CreateDecisionProvenanceRequest(); // CreateDecisionProvenanceRequest | 
    try {
      RecordDecisionProvenance201Response result = apiInstance.recordDecisionProvenance(createDecisionProvenanceRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling DecisionIntelligenceApi#recordDecisionProvenance");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters

| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createDecisionProvenanceRequest** | [**CreateDecisionProvenanceRequest**](CreateDecisionProvenanceRequest.md)|  | |

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
| **201** | Provenance record |  -  |
| **404** | Decision provenance disabled |  -  |
| **503** | Provenance store unavailable |  -  |

