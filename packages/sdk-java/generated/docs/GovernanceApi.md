# GovernanceApi

All URIs are relative to *http://localhost:9876/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createGovernanceExceptionRequest**](GovernanceApi.md#createGovernanceExceptionRequest) | **POST** /governance/exceptions | Create exception request (pending — no auto-approve) |
| [**getGovernanceException**](GovernanceApi.md#getGovernanceException) | **GET** /governance/exceptions/{exceptionId} | Governance exception request detail |
| [**getGovernanceManifest**](GovernanceApi.md#getGovernanceManifest) | **GET** /governance/manifest | Memory governance manifest (ADR-1020 / ADR-1021) |
| [**getPolicyDenialSummary**](GovernanceApi.md#getPolicyDenialSummary) | **GET** /governance/denials/summary | Aggregated denial counts by evaluation point |
| [**getStewardshipRun**](GovernanceApi.md#getStewardshipRun) | **GET** /governance/stewardship/runs/{runId} | Stewardship run detail |
| [**listGovernanceExceptions**](GovernanceApi.md#listGovernanceExceptions) | **GET** /governance/exceptions | List governance exception requests (PI-1027-B / ADR-1029) |
| [**listPolicyDenials**](GovernanceApi.md#listPolicyDenials) | **GET** /governance/denials | List policy denial events (PI-1027-C / ADR-1028 D4) |
| [**listStewardshipRuns**](GovernanceApi.md#listStewardshipRuns) | **GET** /governance/stewardship/runs | List stewardship run history for authenticated owner |


<a id="createGovernanceExceptionRequest"></a>
# **createGovernanceExceptionRequest**
> CreateGovernanceExceptionRequest201Response createGovernanceExceptionRequest(createGovernanceExceptionRequest)

Create exception request (pending — no auto-approve)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.GovernanceApi;

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

    GovernanceApi apiInstance = new GovernanceApi(defaultClient);
    CreateGovernanceExceptionRequest createGovernanceExceptionRequest = new CreateGovernanceExceptionRequest(); // CreateGovernanceExceptionRequest | 
    try {
      CreateGovernanceExceptionRequest201Response result = apiInstance.createGovernanceExceptionRequest(createGovernanceExceptionRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling GovernanceApi#createGovernanceExceptionRequest");
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
| **createGovernanceExceptionRequest** | [**CreateGovernanceExceptionRequest**](CreateGovernanceExceptionRequest.md)|  | |

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
| **201** | Created exception request |  -  |

<a id="getGovernanceException"></a>
# **getGovernanceException**
> CreateGovernanceExceptionRequest201Response getGovernanceException(exceptionId)

Governance exception request detail

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.GovernanceApi;

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

    GovernanceApi apiInstance = new GovernanceApi(defaultClient);
    String exceptionId = "exceptionId_example"; // String | 
    try {
      CreateGovernanceExceptionRequest201Response result = apiInstance.getGovernanceException(exceptionId);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling GovernanceApi#getGovernanceException");
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
| **exceptionId** | **String**|  | |

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
| **200** | Exception detail |  -  |

<a id="getGovernanceManifest"></a>
# **getGovernanceManifest**
> getGovernanceManifest()

Memory governance manifest (ADR-1020 / ADR-1021)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.GovernanceApi;

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

    GovernanceApi apiInstance = new GovernanceApi(defaultClient);
    try {
      apiInstance.getGovernanceManifest();
    } catch (ApiException e) {
      System.err.println("Exception when calling GovernanceApi#getGovernanceManifest");
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

null (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Governance manifest registry |  -  |

<a id="getPolicyDenialSummary"></a>
# **getPolicyDenialSummary**
> GetPolicyDenialSummary200Response getPolicyDenialSummary(since)

Aggregated denial counts by evaluation point

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.GovernanceApi;

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

    GovernanceApi apiInstance = new GovernanceApi(defaultClient);
    OffsetDateTime since = OffsetDateTime.now(); // OffsetDateTime | 
    try {
      GetPolicyDenialSummary200Response result = apiInstance.getPolicyDenialSummary(since);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling GovernanceApi#getPolicyDenialSummary");
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
| **since** | **OffsetDateTime**|  | [optional] |

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
| **200** | Denial summary |  -  |

<a id="getStewardshipRun"></a>
# **getStewardshipRun**
> getStewardshipRun(runId)

Stewardship run detail

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.GovernanceApi;

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

    GovernanceApi apiInstance = new GovernanceApi(defaultClient);
    String runId = "runId_example"; // String | 
    try {
      apiInstance.getStewardshipRun(runId);
    } catch (ApiException e) {
      System.err.println("Exception when calling GovernanceApi#getStewardshipRun");
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
| **runId** | **String**|  | |

### Return type

null (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Stewardship run |  -  |

<a id="listGovernanceExceptions"></a>
# **listGovernanceExceptions**
> ListGovernanceExceptions200Response listGovernanceExceptions(limit)

List governance exception requests (PI-1027-B / ADR-1029)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.GovernanceApi;

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

    GovernanceApi apiInstance = new GovernanceApi(defaultClient);
    Integer limit = 56; // Integer | 
    try {
      ListGovernanceExceptions200Response result = apiInstance.listGovernanceExceptions(limit);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling GovernanceApi#listGovernanceExceptions");
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
| **limit** | **Integer**|  | [optional] |

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
| **200** | Exception list |  -  |

<a id="listPolicyDenials"></a>
# **listPolicyDenials**
> ListPolicyDenials200Response listPolicyDenials(limit, since)

List policy denial events (PI-1027-C / ADR-1028 D4)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.GovernanceApi;

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

    GovernanceApi apiInstance = new GovernanceApi(defaultClient);
    Integer limit = 56; // Integer | 
    OffsetDateTime since = OffsetDateTime.now(); // OffsetDateTime | 
    try {
      ListPolicyDenials200Response result = apiInstance.listPolicyDenials(limit, since);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling GovernanceApi#listPolicyDenials");
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
| **limit** | **Integer**|  | [optional] |
| **since** | **OffsetDateTime**|  | [optional] |

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
| **200** | Denial events |  -  |

<a id="listStewardshipRuns"></a>
# **listStewardshipRuns**
> listStewardshipRuns(limit)

List stewardship run history for authenticated owner

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.GovernanceApi;

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

    GovernanceApi apiInstance = new GovernanceApi(defaultClient);
    Integer limit = 56; // Integer | 
    try {
      apiInstance.listStewardshipRuns(limit);
    } catch (ApiException e) {
      System.err.println("Exception when calling GovernanceApi#listStewardshipRuns");
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
| **limit** | **Integer**|  | [optional] |

### Return type

null (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Stewardship runs |  -  |

