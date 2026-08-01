# ratary_sdk.Api.GovernanceApi

All URIs are relative to *http://localhost:9876/api/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**CreateGovernanceExceptionRequest**](GovernanceApi.md#creategovernanceexceptionrequest) | **POST** /governance/exceptions | Create exception request (pending — no auto-approve) |
| [**GetGovernanceException**](GovernanceApi.md#getgovernanceexception) | **GET** /governance/exceptions/{exceptionId} | Governance exception request detail |
| [**GetGovernanceManifest**](GovernanceApi.md#getgovernancemanifest) | **GET** /governance/manifest | Memory governance manifest (ADR-1020 / ADR-1021) |
| [**GetPolicyDenialSummary**](GovernanceApi.md#getpolicydenialsummary) | **GET** /governance/denials/summary | Aggregated denial counts by evaluation point |
| [**GetStewardshipRun**](GovernanceApi.md#getstewardshiprun) | **GET** /governance/stewardship/runs/{runId} | Stewardship run detail |
| [**ListGovernanceExceptions**](GovernanceApi.md#listgovernanceexceptions) | **GET** /governance/exceptions | List governance exception requests (PI-1027-B / ADR-1029) |
| [**ListPolicyDenials**](GovernanceApi.md#listpolicydenials) | **GET** /governance/denials | List policy denial events (PI-1027-C / ADR-1028 D4) |
| [**ListStewardshipRuns**](GovernanceApi.md#liststewardshipruns) | **GET** /governance/stewardship/runs | List stewardship run history for authenticated owner |

<a id="creategovernanceexceptionrequest"></a>
# **CreateGovernanceExceptionRequest**
> CreateGovernanceExceptionRequest201Response CreateGovernanceExceptionRequest (CreateGovernanceExceptionRequest createGovernanceExceptionRequest)

Create exception request (pending — no auto-approve)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **createGovernanceExceptionRequest** | [**CreateGovernanceExceptionRequest**](CreateGovernanceExceptionRequest.md) |  |  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="getgovernanceexception"></a>
# **GetGovernanceException**
> CreateGovernanceExceptionRequest201Response GetGovernanceException (string exceptionId)

Governance exception request detail


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **exceptionId** | **string** |  |  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="getgovernancemanifest"></a>
# **GetGovernanceManifest**
> void GetGovernanceManifest ()

Memory governance manifest (ADR-1020 / ADR-1021)


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
| **200** | Governance manifest registry |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="getpolicydenialsummary"></a>
# **GetPolicyDenialSummary**
> GetPolicyDenialSummary200Response GetPolicyDenialSummary (DateTime since = null)

Aggregated denial counts by evaluation point


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **since** | **DateTime** |  | [optional]  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="getstewardshiprun"></a>
# **GetStewardshipRun**
> void GetStewardshipRun (string runId)

Stewardship run detail


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **runId** | **string** |  |  |

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
| **200** | Stewardship run |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="listgovernanceexceptions"></a>
# **ListGovernanceExceptions**
> ListGovernanceExceptions200Response ListGovernanceExceptions (int limit = null)

List governance exception requests (PI-1027-B / ADR-1029)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **limit** | **int** |  | [optional]  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="listpolicydenials"></a>
# **ListPolicyDenials**
> ListPolicyDenials200Response ListPolicyDenials (int limit = null, DateTime since = null)

List policy denial events (PI-1027-C / ADR-1028 D4)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **limit** | **int** |  | [optional]  |
| **since** | **DateTime** |  | [optional]  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="liststewardshipruns"></a>
# **ListStewardshipRuns**
> void ListStewardshipRuns (int limit = null)

List stewardship run history for authenticated owner


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **limit** | **int** |  | [optional]  |

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
| **200** | Stewardship runs |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

