# GovernanceExceptionRecord

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ExceptionId** | **string** |  | 
**OwnerId** | **string** |  | 
**ExceptionClass** | **string** |  | 
**Rationale** | **string** |  | 
**Status** | **string** |  | 
**RequestedBy** | **string** |  | 
**RequestedAt** | **time.Time** |  | 
**ExpiresAt** | Pointer to **time.Time** |  | [optional] 
**AuditLog** | [**[]GovernanceExceptionRecordAuditLogInner**](GovernanceExceptionRecordAuditLogInner.md) |  | 

## Methods

### NewGovernanceExceptionRecord

`func NewGovernanceExceptionRecord(exceptionId string, ownerId string, exceptionClass string, rationale string, status string, requestedBy string, requestedAt time.Time, auditLog []GovernanceExceptionRecordAuditLogInner, ) *GovernanceExceptionRecord`

NewGovernanceExceptionRecord instantiates a new GovernanceExceptionRecord object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGovernanceExceptionRecordWithDefaults

`func NewGovernanceExceptionRecordWithDefaults() *GovernanceExceptionRecord`

NewGovernanceExceptionRecordWithDefaults instantiates a new GovernanceExceptionRecord object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetExceptionId

`func (o *GovernanceExceptionRecord) GetExceptionId() string`

GetExceptionId returns the ExceptionId field if non-nil, zero value otherwise.

### GetExceptionIdOk

`func (o *GovernanceExceptionRecord) GetExceptionIdOk() (*string, bool)`

GetExceptionIdOk returns a tuple with the ExceptionId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExceptionId

`func (o *GovernanceExceptionRecord) SetExceptionId(v string)`

SetExceptionId sets ExceptionId field to given value.


### GetOwnerId

`func (o *GovernanceExceptionRecord) GetOwnerId() string`

GetOwnerId returns the OwnerId field if non-nil, zero value otherwise.

### GetOwnerIdOk

`func (o *GovernanceExceptionRecord) GetOwnerIdOk() (*string, bool)`

GetOwnerIdOk returns a tuple with the OwnerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOwnerId

`func (o *GovernanceExceptionRecord) SetOwnerId(v string)`

SetOwnerId sets OwnerId field to given value.


### GetExceptionClass

`func (o *GovernanceExceptionRecord) GetExceptionClass() string`

GetExceptionClass returns the ExceptionClass field if non-nil, zero value otherwise.

### GetExceptionClassOk

`func (o *GovernanceExceptionRecord) GetExceptionClassOk() (*string, bool)`

GetExceptionClassOk returns a tuple with the ExceptionClass field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExceptionClass

`func (o *GovernanceExceptionRecord) SetExceptionClass(v string)`

SetExceptionClass sets ExceptionClass field to given value.


### GetRationale

`func (o *GovernanceExceptionRecord) GetRationale() string`

GetRationale returns the Rationale field if non-nil, zero value otherwise.

### GetRationaleOk

`func (o *GovernanceExceptionRecord) GetRationaleOk() (*string, bool)`

GetRationaleOk returns a tuple with the Rationale field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRationale

`func (o *GovernanceExceptionRecord) SetRationale(v string)`

SetRationale sets Rationale field to given value.


### GetStatus

`func (o *GovernanceExceptionRecord) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *GovernanceExceptionRecord) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *GovernanceExceptionRecord) SetStatus(v string)`

SetStatus sets Status field to given value.


### GetRequestedBy

`func (o *GovernanceExceptionRecord) GetRequestedBy() string`

GetRequestedBy returns the RequestedBy field if non-nil, zero value otherwise.

### GetRequestedByOk

`func (o *GovernanceExceptionRecord) GetRequestedByOk() (*string, bool)`

GetRequestedByOk returns a tuple with the RequestedBy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRequestedBy

`func (o *GovernanceExceptionRecord) SetRequestedBy(v string)`

SetRequestedBy sets RequestedBy field to given value.


### GetRequestedAt

`func (o *GovernanceExceptionRecord) GetRequestedAt() time.Time`

GetRequestedAt returns the RequestedAt field if non-nil, zero value otherwise.

### GetRequestedAtOk

`func (o *GovernanceExceptionRecord) GetRequestedAtOk() (*time.Time, bool)`

GetRequestedAtOk returns a tuple with the RequestedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRequestedAt

`func (o *GovernanceExceptionRecord) SetRequestedAt(v time.Time)`

SetRequestedAt sets RequestedAt field to given value.


### GetExpiresAt

`func (o *GovernanceExceptionRecord) GetExpiresAt() time.Time`

GetExpiresAt returns the ExpiresAt field if non-nil, zero value otherwise.

### GetExpiresAtOk

`func (o *GovernanceExceptionRecord) GetExpiresAtOk() (*time.Time, bool)`

GetExpiresAtOk returns a tuple with the ExpiresAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExpiresAt

`func (o *GovernanceExceptionRecord) SetExpiresAt(v time.Time)`

SetExpiresAt sets ExpiresAt field to given value.

### HasExpiresAt

`func (o *GovernanceExceptionRecord) HasExpiresAt() bool`

HasExpiresAt returns a boolean if a field has been set.

### GetAuditLog

`func (o *GovernanceExceptionRecord) GetAuditLog() []GovernanceExceptionRecordAuditLogInner`

GetAuditLog returns the AuditLog field if non-nil, zero value otherwise.

### GetAuditLogOk

`func (o *GovernanceExceptionRecord) GetAuditLogOk() (*[]GovernanceExceptionRecordAuditLogInner, bool)`

GetAuditLogOk returns a tuple with the AuditLog field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAuditLog

`func (o *GovernanceExceptionRecord) SetAuditLog(v []GovernanceExceptionRecordAuditLogInner)`

SetAuditLog sets AuditLog field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


