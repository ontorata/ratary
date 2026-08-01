# RecommendationCard

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CardId** | **string** |  | 
**Title** | **string** |  | 
**Advisory** | **bool** |  | 
**MemoryId** | Pointer to **string** |  | [optional] 
**SourceReference** | **string** |  | 
**Confidence** | Pointer to **float32** |  | [optional] 
**EvidenceRefs** | **[]string** |  | 
**Reason** | **string** |  | 

## Methods

### NewRecommendationCard

`func NewRecommendationCard(cardId string, title string, advisory bool, sourceReference string, evidenceRefs []string, reason string, ) *RecommendationCard`

NewRecommendationCard instantiates a new RecommendationCard object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewRecommendationCardWithDefaults

`func NewRecommendationCardWithDefaults() *RecommendationCard`

NewRecommendationCardWithDefaults instantiates a new RecommendationCard object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCardId

`func (o *RecommendationCard) GetCardId() string`

GetCardId returns the CardId field if non-nil, zero value otherwise.

### GetCardIdOk

`func (o *RecommendationCard) GetCardIdOk() (*string, bool)`

GetCardIdOk returns a tuple with the CardId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCardId

`func (o *RecommendationCard) SetCardId(v string)`

SetCardId sets CardId field to given value.


### GetTitle

`func (o *RecommendationCard) GetTitle() string`

GetTitle returns the Title field if non-nil, zero value otherwise.

### GetTitleOk

`func (o *RecommendationCard) GetTitleOk() (*string, bool)`

GetTitleOk returns a tuple with the Title field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTitle

`func (o *RecommendationCard) SetTitle(v string)`

SetTitle sets Title field to given value.


### GetAdvisory

`func (o *RecommendationCard) GetAdvisory() bool`

GetAdvisory returns the Advisory field if non-nil, zero value otherwise.

### GetAdvisoryOk

`func (o *RecommendationCard) GetAdvisoryOk() (*bool, bool)`

GetAdvisoryOk returns a tuple with the Advisory field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAdvisory

`func (o *RecommendationCard) SetAdvisory(v bool)`

SetAdvisory sets Advisory field to given value.


### GetMemoryId

`func (o *RecommendationCard) GetMemoryId() string`

GetMemoryId returns the MemoryId field if non-nil, zero value otherwise.

### GetMemoryIdOk

`func (o *RecommendationCard) GetMemoryIdOk() (*string, bool)`

GetMemoryIdOk returns a tuple with the MemoryId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMemoryId

`func (o *RecommendationCard) SetMemoryId(v string)`

SetMemoryId sets MemoryId field to given value.

### HasMemoryId

`func (o *RecommendationCard) HasMemoryId() bool`

HasMemoryId returns a boolean if a field has been set.

### GetSourceReference

`func (o *RecommendationCard) GetSourceReference() string`

GetSourceReference returns the SourceReference field if non-nil, zero value otherwise.

### GetSourceReferenceOk

`func (o *RecommendationCard) GetSourceReferenceOk() (*string, bool)`

GetSourceReferenceOk returns a tuple with the SourceReference field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSourceReference

`func (o *RecommendationCard) SetSourceReference(v string)`

SetSourceReference sets SourceReference field to given value.


### GetConfidence

`func (o *RecommendationCard) GetConfidence() float32`

GetConfidence returns the Confidence field if non-nil, zero value otherwise.

### GetConfidenceOk

`func (o *RecommendationCard) GetConfidenceOk() (*float32, bool)`

GetConfidenceOk returns a tuple with the Confidence field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfidence

`func (o *RecommendationCard) SetConfidence(v float32)`

SetConfidence sets Confidence field to given value.

### HasConfidence

`func (o *RecommendationCard) HasConfidence() bool`

HasConfidence returns a boolean if a field has been set.

### GetEvidenceRefs

`func (o *RecommendationCard) GetEvidenceRefs() []string`

GetEvidenceRefs returns the EvidenceRefs field if non-nil, zero value otherwise.

### GetEvidenceRefsOk

`func (o *RecommendationCard) GetEvidenceRefsOk() (*[]string, bool)`

GetEvidenceRefsOk returns a tuple with the EvidenceRefs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEvidenceRefs

`func (o *RecommendationCard) SetEvidenceRefs(v []string)`

SetEvidenceRefs sets EvidenceRefs field to given value.


### GetReason

`func (o *RecommendationCard) GetReason() string`

GetReason returns the Reason field if non-nil, zero value otherwise.

### GetReasonOk

`func (o *RecommendationCard) GetReasonOk() (*string, bool)`

GetReasonOk returns a tuple with the Reason field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetReason

`func (o *RecommendationCard) SetReason(v string)`

SetReason sets Reason field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


