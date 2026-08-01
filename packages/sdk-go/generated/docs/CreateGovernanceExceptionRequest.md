# CreateGovernanceExceptionRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ExceptionClass** | **string** |  | 
**Rationale** | **string** |  | 
**ExpiresAt** | Pointer to **time.Time** |  | [optional] 

## Methods

### NewCreateGovernanceExceptionRequest

`func NewCreateGovernanceExceptionRequest(exceptionClass string, rationale string, ) *CreateGovernanceExceptionRequest`

NewCreateGovernanceExceptionRequest instantiates a new CreateGovernanceExceptionRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateGovernanceExceptionRequestWithDefaults

`func NewCreateGovernanceExceptionRequestWithDefaults() *CreateGovernanceExceptionRequest`

NewCreateGovernanceExceptionRequestWithDefaults instantiates a new CreateGovernanceExceptionRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetExceptionClass

`func (o *CreateGovernanceExceptionRequest) GetExceptionClass() string`

GetExceptionClass returns the ExceptionClass field if non-nil, zero value otherwise.

### GetExceptionClassOk

`func (o *CreateGovernanceExceptionRequest) GetExceptionClassOk() (*string, bool)`

GetExceptionClassOk returns a tuple with the ExceptionClass field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExceptionClass

`func (o *CreateGovernanceExceptionRequest) SetExceptionClass(v string)`

SetExceptionClass sets ExceptionClass field to given value.


### GetRationale

`func (o *CreateGovernanceExceptionRequest) GetRationale() string`

GetRationale returns the Rationale field if non-nil, zero value otherwise.

### GetRationaleOk

`func (o *CreateGovernanceExceptionRequest) GetRationaleOk() (*string, bool)`

GetRationaleOk returns a tuple with the Rationale field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRationale

`func (o *CreateGovernanceExceptionRequest) SetRationale(v string)`

SetRationale sets Rationale field to given value.


### GetExpiresAt

`func (o *CreateGovernanceExceptionRequest) GetExpiresAt() time.Time`

GetExpiresAt returns the ExpiresAt field if non-nil, zero value otherwise.

### GetExpiresAtOk

`func (o *CreateGovernanceExceptionRequest) GetExpiresAtOk() (*time.Time, bool)`

GetExpiresAtOk returns a tuple with the ExpiresAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExpiresAt

`func (o *CreateGovernanceExceptionRequest) SetExpiresAt(v time.Time)`

SetExpiresAt sets ExpiresAt field to given value.

### HasExpiresAt

`func (o *CreateGovernanceExceptionRequest) HasExpiresAt() bool`

HasExpiresAt returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


