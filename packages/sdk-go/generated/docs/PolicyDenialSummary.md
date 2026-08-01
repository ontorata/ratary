# PolicyDenialSummary

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Since** | **time.Time** |  | 
**ByPoint** | [**PolicyDenialSummaryByPoint**](PolicyDenialSummaryByPoint.md) |  | 
**Total** | **int32** |  | 

## Methods

### NewPolicyDenialSummary

`func NewPolicyDenialSummary(since time.Time, byPoint PolicyDenialSummaryByPoint, total int32, ) *PolicyDenialSummary`

NewPolicyDenialSummary instantiates a new PolicyDenialSummary object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPolicyDenialSummaryWithDefaults

`func NewPolicyDenialSummaryWithDefaults() *PolicyDenialSummary`

NewPolicyDenialSummaryWithDefaults instantiates a new PolicyDenialSummary object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetSince

`func (o *PolicyDenialSummary) GetSince() time.Time`

GetSince returns the Since field if non-nil, zero value otherwise.

### GetSinceOk

`func (o *PolicyDenialSummary) GetSinceOk() (*time.Time, bool)`

GetSinceOk returns a tuple with the Since field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSince

`func (o *PolicyDenialSummary) SetSince(v time.Time)`

SetSince sets Since field to given value.


### GetByPoint

`func (o *PolicyDenialSummary) GetByPoint() PolicyDenialSummaryByPoint`

GetByPoint returns the ByPoint field if non-nil, zero value otherwise.

### GetByPointOk

`func (o *PolicyDenialSummary) GetByPointOk() (*PolicyDenialSummaryByPoint, bool)`

GetByPointOk returns a tuple with the ByPoint field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetByPoint

`func (o *PolicyDenialSummary) SetByPoint(v PolicyDenialSummaryByPoint)`

SetByPoint sets ByPoint field to given value.


### GetTotal

`func (o *PolicyDenialSummary) GetTotal() int32`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *PolicyDenialSummary) GetTotalOk() (*int32, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *PolicyDenialSummary) SetTotal(v int32)`

SetTotal sets Total field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


