# PolicyDenialEvent

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**DenialId** | **string** |  | 
**OwnerId** | **string** |  | 
**Point** | **string** |  | 
**PolicyModuleId** | Pointer to **string** |  | [optional] 
**ReasonCode** | **string** |  | 
**OccurredAt** | **time.Time** |  | 
**MemoryId** | Pointer to **string** |  | [optional] 
**Resource** | Pointer to **string** |  | [optional] 

## Methods

### NewPolicyDenialEvent

`func NewPolicyDenialEvent(denialId string, ownerId string, point string, reasonCode string, occurredAt time.Time, ) *PolicyDenialEvent`

NewPolicyDenialEvent instantiates a new PolicyDenialEvent object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPolicyDenialEventWithDefaults

`func NewPolicyDenialEventWithDefaults() *PolicyDenialEvent`

NewPolicyDenialEventWithDefaults instantiates a new PolicyDenialEvent object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDenialId

`func (o *PolicyDenialEvent) GetDenialId() string`

GetDenialId returns the DenialId field if non-nil, zero value otherwise.

### GetDenialIdOk

`func (o *PolicyDenialEvent) GetDenialIdOk() (*string, bool)`

GetDenialIdOk returns a tuple with the DenialId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDenialId

`func (o *PolicyDenialEvent) SetDenialId(v string)`

SetDenialId sets DenialId field to given value.


### GetOwnerId

`func (o *PolicyDenialEvent) GetOwnerId() string`

GetOwnerId returns the OwnerId field if non-nil, zero value otherwise.

### GetOwnerIdOk

`func (o *PolicyDenialEvent) GetOwnerIdOk() (*string, bool)`

GetOwnerIdOk returns a tuple with the OwnerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOwnerId

`func (o *PolicyDenialEvent) SetOwnerId(v string)`

SetOwnerId sets OwnerId field to given value.


### GetPoint

`func (o *PolicyDenialEvent) GetPoint() string`

GetPoint returns the Point field if non-nil, zero value otherwise.

### GetPointOk

`func (o *PolicyDenialEvent) GetPointOk() (*string, bool)`

GetPointOk returns a tuple with the Point field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPoint

`func (o *PolicyDenialEvent) SetPoint(v string)`

SetPoint sets Point field to given value.


### GetPolicyModuleId

`func (o *PolicyDenialEvent) GetPolicyModuleId() string`

GetPolicyModuleId returns the PolicyModuleId field if non-nil, zero value otherwise.

### GetPolicyModuleIdOk

`func (o *PolicyDenialEvent) GetPolicyModuleIdOk() (*string, bool)`

GetPolicyModuleIdOk returns a tuple with the PolicyModuleId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPolicyModuleId

`func (o *PolicyDenialEvent) SetPolicyModuleId(v string)`

SetPolicyModuleId sets PolicyModuleId field to given value.

### HasPolicyModuleId

`func (o *PolicyDenialEvent) HasPolicyModuleId() bool`

HasPolicyModuleId returns a boolean if a field has been set.

### GetReasonCode

`func (o *PolicyDenialEvent) GetReasonCode() string`

GetReasonCode returns the ReasonCode field if non-nil, zero value otherwise.

### GetReasonCodeOk

`func (o *PolicyDenialEvent) GetReasonCodeOk() (*string, bool)`

GetReasonCodeOk returns a tuple with the ReasonCode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetReasonCode

`func (o *PolicyDenialEvent) SetReasonCode(v string)`

SetReasonCode sets ReasonCode field to given value.


### GetOccurredAt

`func (o *PolicyDenialEvent) GetOccurredAt() time.Time`

GetOccurredAt returns the OccurredAt field if non-nil, zero value otherwise.

### GetOccurredAtOk

`func (o *PolicyDenialEvent) GetOccurredAtOk() (*time.Time, bool)`

GetOccurredAtOk returns a tuple with the OccurredAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOccurredAt

`func (o *PolicyDenialEvent) SetOccurredAt(v time.Time)`

SetOccurredAt sets OccurredAt field to given value.


### GetMemoryId

`func (o *PolicyDenialEvent) GetMemoryId() string`

GetMemoryId returns the MemoryId field if non-nil, zero value otherwise.

### GetMemoryIdOk

`func (o *PolicyDenialEvent) GetMemoryIdOk() (*string, bool)`

GetMemoryIdOk returns a tuple with the MemoryId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMemoryId

`func (o *PolicyDenialEvent) SetMemoryId(v string)`

SetMemoryId sets MemoryId field to given value.

### HasMemoryId

`func (o *PolicyDenialEvent) HasMemoryId() bool`

HasMemoryId returns a boolean if a field has been set.

### GetResource

`func (o *PolicyDenialEvent) GetResource() string`

GetResource returns the Resource field if non-nil, zero value otherwise.

### GetResourceOk

`func (o *PolicyDenialEvent) GetResourceOk() (*string, bool)`

GetResourceOk returns a tuple with the Resource field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResource

`func (o *PolicyDenialEvent) SetResource(v string)`

SetResource sets Resource field to given value.

### HasResource

`func (o *PolicyDenialEvent) HasResource() bool`

HasResource returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


