# FetchRecommendationsRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Query** | **string** |  | 
**Limit** | Pointer to **int32** |  | [optional] 
**DecisionModelId** | Pointer to **string** | Optional PI-P6-D1.1 computed model for re-rank | [optional] 
**DecisionModelVersion** | Pointer to **string** |  | [optional] 

## Methods

### NewFetchRecommendationsRequest

`func NewFetchRecommendationsRequest(query string, ) *FetchRecommendationsRequest`

NewFetchRecommendationsRequest instantiates a new FetchRecommendationsRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewFetchRecommendationsRequestWithDefaults

`func NewFetchRecommendationsRequestWithDefaults() *FetchRecommendationsRequest`

NewFetchRecommendationsRequestWithDefaults instantiates a new FetchRecommendationsRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetQuery

`func (o *FetchRecommendationsRequest) GetQuery() string`

GetQuery returns the Query field if non-nil, zero value otherwise.

### GetQueryOk

`func (o *FetchRecommendationsRequest) GetQueryOk() (*string, bool)`

GetQueryOk returns a tuple with the Query field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetQuery

`func (o *FetchRecommendationsRequest) SetQuery(v string)`

SetQuery sets Query field to given value.


### GetLimit

`func (o *FetchRecommendationsRequest) GetLimit() int32`

GetLimit returns the Limit field if non-nil, zero value otherwise.

### GetLimitOk

`func (o *FetchRecommendationsRequest) GetLimitOk() (*int32, bool)`

GetLimitOk returns a tuple with the Limit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLimit

`func (o *FetchRecommendationsRequest) SetLimit(v int32)`

SetLimit sets Limit field to given value.

### HasLimit

`func (o *FetchRecommendationsRequest) HasLimit() bool`

HasLimit returns a boolean if a field has been set.

### GetDecisionModelId

`func (o *FetchRecommendationsRequest) GetDecisionModelId() string`

GetDecisionModelId returns the DecisionModelId field if non-nil, zero value otherwise.

### GetDecisionModelIdOk

`func (o *FetchRecommendationsRequest) GetDecisionModelIdOk() (*string, bool)`

GetDecisionModelIdOk returns a tuple with the DecisionModelId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDecisionModelId

`func (o *FetchRecommendationsRequest) SetDecisionModelId(v string)`

SetDecisionModelId sets DecisionModelId field to given value.

### HasDecisionModelId

`func (o *FetchRecommendationsRequest) HasDecisionModelId() bool`

HasDecisionModelId returns a boolean if a field has been set.

### GetDecisionModelVersion

`func (o *FetchRecommendationsRequest) GetDecisionModelVersion() string`

GetDecisionModelVersion returns the DecisionModelVersion field if non-nil, zero value otherwise.

### GetDecisionModelVersionOk

`func (o *FetchRecommendationsRequest) GetDecisionModelVersionOk() (*string, bool)`

GetDecisionModelVersionOk returns a tuple with the DecisionModelVersion field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDecisionModelVersion

`func (o *FetchRecommendationsRequest) SetDecisionModelVersion(v string)`

SetDecisionModelVersion sets DecisionModelVersion field to given value.

### HasDecisionModelVersion

`func (o *FetchRecommendationsRequest) HasDecisionModelVersion() bool`

HasDecisionModelVersion returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


