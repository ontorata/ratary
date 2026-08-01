# FetchRecommendationsResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**TraceId** | **string** |  | 
**Cards** | [**[]RecommendationCard**](RecommendationCard.md) |  | 
**Advisory** | **bool** |  | 

## Methods

### NewFetchRecommendationsResponse

`func NewFetchRecommendationsResponse(traceId string, cards []RecommendationCard, advisory bool, ) *FetchRecommendationsResponse`

NewFetchRecommendationsResponse instantiates a new FetchRecommendationsResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewFetchRecommendationsResponseWithDefaults

`func NewFetchRecommendationsResponseWithDefaults() *FetchRecommendationsResponse`

NewFetchRecommendationsResponseWithDefaults instantiates a new FetchRecommendationsResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTraceId

`func (o *FetchRecommendationsResponse) GetTraceId() string`

GetTraceId returns the TraceId field if non-nil, zero value otherwise.

### GetTraceIdOk

`func (o *FetchRecommendationsResponse) GetTraceIdOk() (*string, bool)`

GetTraceIdOk returns a tuple with the TraceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTraceId

`func (o *FetchRecommendationsResponse) SetTraceId(v string)`

SetTraceId sets TraceId field to given value.


### GetCards

`func (o *FetchRecommendationsResponse) GetCards() []RecommendationCard`

GetCards returns the Cards field if non-nil, zero value otherwise.

### GetCardsOk

`func (o *FetchRecommendationsResponse) GetCardsOk() (*[]RecommendationCard, bool)`

GetCardsOk returns a tuple with the Cards field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCards

`func (o *FetchRecommendationsResponse) SetCards(v []RecommendationCard)`

SetCards sets Cards field to given value.


### GetAdvisory

`func (o *FetchRecommendationsResponse) GetAdvisory() bool`

GetAdvisory returns the Advisory field if non-nil, zero value otherwise.

### GetAdvisoryOk

`func (o *FetchRecommendationsResponse) GetAdvisoryOk() (*bool, bool)`

GetAdvisoryOk returns a tuple with the Advisory field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAdvisory

`func (o *FetchRecommendationsResponse) SetAdvisory(v bool)`

SetAdvisory sets Advisory field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


