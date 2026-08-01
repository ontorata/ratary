# GovernanceExceptionRecordAuditLogInner

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**At** | **time.Time** |  | 
**Action** | **string** |  | 
**Actor** | Pointer to **string** |  | [optional] 
**Note** | Pointer to **string** |  | [optional] 

## Methods

### NewGovernanceExceptionRecordAuditLogInner

`func NewGovernanceExceptionRecordAuditLogInner(at time.Time, action string, ) *GovernanceExceptionRecordAuditLogInner`

NewGovernanceExceptionRecordAuditLogInner instantiates a new GovernanceExceptionRecordAuditLogInner object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGovernanceExceptionRecordAuditLogInnerWithDefaults

`func NewGovernanceExceptionRecordAuditLogInnerWithDefaults() *GovernanceExceptionRecordAuditLogInner`

NewGovernanceExceptionRecordAuditLogInnerWithDefaults instantiates a new GovernanceExceptionRecordAuditLogInner object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAt

`func (o *GovernanceExceptionRecordAuditLogInner) GetAt() time.Time`

GetAt returns the At field if non-nil, zero value otherwise.

### GetAtOk

`func (o *GovernanceExceptionRecordAuditLogInner) GetAtOk() (*time.Time, bool)`

GetAtOk returns a tuple with the At field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAt

`func (o *GovernanceExceptionRecordAuditLogInner) SetAt(v time.Time)`

SetAt sets At field to given value.


### GetAction

`func (o *GovernanceExceptionRecordAuditLogInner) GetAction() string`

GetAction returns the Action field if non-nil, zero value otherwise.

### GetActionOk

`func (o *GovernanceExceptionRecordAuditLogInner) GetActionOk() (*string, bool)`

GetActionOk returns a tuple with the Action field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAction

`func (o *GovernanceExceptionRecordAuditLogInner) SetAction(v string)`

SetAction sets Action field to given value.


### GetActor

`func (o *GovernanceExceptionRecordAuditLogInner) GetActor() string`

GetActor returns the Actor field if non-nil, zero value otherwise.

### GetActorOk

`func (o *GovernanceExceptionRecordAuditLogInner) GetActorOk() (*string, bool)`

GetActorOk returns a tuple with the Actor field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetActor

`func (o *GovernanceExceptionRecordAuditLogInner) SetActor(v string)`

SetActor sets Actor field to given value.

### HasActor

`func (o *GovernanceExceptionRecordAuditLogInner) HasActor() bool`

HasActor returns a boolean if a field has been set.

### GetNote

`func (o *GovernanceExceptionRecordAuditLogInner) GetNote() string`

GetNote returns the Note field if non-nil, zero value otherwise.

### GetNoteOk

`func (o *GovernanceExceptionRecordAuditLogInner) GetNoteOk() (*string, bool)`

GetNoteOk returns a tuple with the Note field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNote

`func (o *GovernanceExceptionRecordAuditLogInner) SetNote(v string)`

SetNote sets Note field to given value.

### HasNote

`func (o *GovernanceExceptionRecordAuditLogInner) HasNote() bool`

HasNote returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


