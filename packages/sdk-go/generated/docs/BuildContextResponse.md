# BuildContextResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Context** | Pointer to **string** |  | [optional] 
**Prompt** | Pointer to **string** |  | [optional] 
**System** | Pointer to **string** |  | [optional] 
**User** | Pointer to **string** |  | [optional] 
**MemoryCount** | Pointer to **int32** |  | [optional] 
**PackageId** | Pointer to **string** | ADR-1011 Ratary-issued Context Package id | [optional] 
**OwnerId** | Pointer to **string** |  | [optional] 
**CreatedAt** | Pointer to **time.Time** |  | [optional] 
**Confidence** | Pointer to **string** |  | [optional] 
**UpdateMechanism** | Pointer to **string** |  | [optional] 
**SourceLabels** | Pointer to **[]string** |  | [optional] 
**Query** | Pointer to **string** |  | [optional] 

## Methods

### NewBuildContextResponse

`func NewBuildContextResponse() *BuildContextResponse`

NewBuildContextResponse instantiates a new BuildContextResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewBuildContextResponseWithDefaults

`func NewBuildContextResponseWithDefaults() *BuildContextResponse`

NewBuildContextResponseWithDefaults instantiates a new BuildContextResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetContext

`func (o *BuildContextResponse) GetContext() string`

GetContext returns the Context field if non-nil, zero value otherwise.

### GetContextOk

`func (o *BuildContextResponse) GetContextOk() (*string, bool)`

GetContextOk returns a tuple with the Context field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetContext

`func (o *BuildContextResponse) SetContext(v string)`

SetContext sets Context field to given value.

### HasContext

`func (o *BuildContextResponse) HasContext() bool`

HasContext returns a boolean if a field has been set.

### GetPrompt

`func (o *BuildContextResponse) GetPrompt() string`

GetPrompt returns the Prompt field if non-nil, zero value otherwise.

### GetPromptOk

`func (o *BuildContextResponse) GetPromptOk() (*string, bool)`

GetPromptOk returns a tuple with the Prompt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPrompt

`func (o *BuildContextResponse) SetPrompt(v string)`

SetPrompt sets Prompt field to given value.

### HasPrompt

`func (o *BuildContextResponse) HasPrompt() bool`

HasPrompt returns a boolean if a field has been set.

### GetSystem

`func (o *BuildContextResponse) GetSystem() string`

GetSystem returns the System field if non-nil, zero value otherwise.

### GetSystemOk

`func (o *BuildContextResponse) GetSystemOk() (*string, bool)`

GetSystemOk returns a tuple with the System field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSystem

`func (o *BuildContextResponse) SetSystem(v string)`

SetSystem sets System field to given value.

### HasSystem

`func (o *BuildContextResponse) HasSystem() bool`

HasSystem returns a boolean if a field has been set.

### GetUser

`func (o *BuildContextResponse) GetUser() string`

GetUser returns the User field if non-nil, zero value otherwise.

### GetUserOk

`func (o *BuildContextResponse) GetUserOk() (*string, bool)`

GetUserOk returns a tuple with the User field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUser

`func (o *BuildContextResponse) SetUser(v string)`

SetUser sets User field to given value.

### HasUser

`func (o *BuildContextResponse) HasUser() bool`

HasUser returns a boolean if a field has been set.

### GetMemoryCount

`func (o *BuildContextResponse) GetMemoryCount() int32`

GetMemoryCount returns the MemoryCount field if non-nil, zero value otherwise.

### GetMemoryCountOk

`func (o *BuildContextResponse) GetMemoryCountOk() (*int32, bool)`

GetMemoryCountOk returns a tuple with the MemoryCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMemoryCount

`func (o *BuildContextResponse) SetMemoryCount(v int32)`

SetMemoryCount sets MemoryCount field to given value.

### HasMemoryCount

`func (o *BuildContextResponse) HasMemoryCount() bool`

HasMemoryCount returns a boolean if a field has been set.

### GetPackageId

`func (o *BuildContextResponse) GetPackageId() string`

GetPackageId returns the PackageId field if non-nil, zero value otherwise.

### GetPackageIdOk

`func (o *BuildContextResponse) GetPackageIdOk() (*string, bool)`

GetPackageIdOk returns a tuple with the PackageId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPackageId

`func (o *BuildContextResponse) SetPackageId(v string)`

SetPackageId sets PackageId field to given value.

### HasPackageId

`func (o *BuildContextResponse) HasPackageId() bool`

HasPackageId returns a boolean if a field has been set.

### GetOwnerId

`func (o *BuildContextResponse) GetOwnerId() string`

GetOwnerId returns the OwnerId field if non-nil, zero value otherwise.

### GetOwnerIdOk

`func (o *BuildContextResponse) GetOwnerIdOk() (*string, bool)`

GetOwnerIdOk returns a tuple with the OwnerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOwnerId

`func (o *BuildContextResponse) SetOwnerId(v string)`

SetOwnerId sets OwnerId field to given value.

### HasOwnerId

`func (o *BuildContextResponse) HasOwnerId() bool`

HasOwnerId returns a boolean if a field has been set.

### GetCreatedAt

`func (o *BuildContextResponse) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *BuildContextResponse) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *BuildContextResponse) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.

### HasCreatedAt

`func (o *BuildContextResponse) HasCreatedAt() bool`

HasCreatedAt returns a boolean if a field has been set.

### GetConfidence

`func (o *BuildContextResponse) GetConfidence() string`

GetConfidence returns the Confidence field if non-nil, zero value otherwise.

### GetConfidenceOk

`func (o *BuildContextResponse) GetConfidenceOk() (*string, bool)`

GetConfidenceOk returns a tuple with the Confidence field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfidence

`func (o *BuildContextResponse) SetConfidence(v string)`

SetConfidence sets Confidence field to given value.

### HasConfidence

`func (o *BuildContextResponse) HasConfidence() bool`

HasConfidence returns a boolean if a field has been set.

### GetUpdateMechanism

`func (o *BuildContextResponse) GetUpdateMechanism() string`

GetUpdateMechanism returns the UpdateMechanism field if non-nil, zero value otherwise.

### GetUpdateMechanismOk

`func (o *BuildContextResponse) GetUpdateMechanismOk() (*string, bool)`

GetUpdateMechanismOk returns a tuple with the UpdateMechanism field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdateMechanism

`func (o *BuildContextResponse) SetUpdateMechanism(v string)`

SetUpdateMechanism sets UpdateMechanism field to given value.

### HasUpdateMechanism

`func (o *BuildContextResponse) HasUpdateMechanism() bool`

HasUpdateMechanism returns a boolean if a field has been set.

### GetSourceLabels

`func (o *BuildContextResponse) GetSourceLabels() []string`

GetSourceLabels returns the SourceLabels field if non-nil, zero value otherwise.

### GetSourceLabelsOk

`func (o *BuildContextResponse) GetSourceLabelsOk() (*[]string, bool)`

GetSourceLabelsOk returns a tuple with the SourceLabels field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSourceLabels

`func (o *BuildContextResponse) SetSourceLabels(v []string)`

SetSourceLabels sets SourceLabels field to given value.

### HasSourceLabels

`func (o *BuildContextResponse) HasSourceLabels() bool`

HasSourceLabels returns a boolean if a field has been set.

### GetQuery

`func (o *BuildContextResponse) GetQuery() string`

GetQuery returns the Query field if non-nil, zero value otherwise.

### GetQueryOk

`func (o *BuildContextResponse) GetQueryOk() (*string, bool)`

GetQueryOk returns a tuple with the Query field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetQuery

`func (o *BuildContextResponse) SetQuery(v string)`

SetQuery sets Query field to given value.

### HasQuery

`func (o *BuildContextResponse) HasQuery() bool`

HasQuery returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


