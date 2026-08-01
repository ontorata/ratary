# FetchRecommendationsRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Query** | **string** |  | 
**Limit** | Pointer to **int32** |  | [optional] 

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


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


