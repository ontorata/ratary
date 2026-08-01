# DecisionProvenanceRecord

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**RecordId** | **string** |  | 
**OwnerId** | **string** |  | 
**BriefId** | **string** |  | 
**PackageId** | Pointer to **string** |  | [optional] 
**Verdict** | **string** |  | 
**Rationale** | Pointer to **string** |  | [optional] 
**SourceMemoryIds** | **[]string** |  | 
**DecisionModelId** | Pointer to **string** |  | [optional] 
**DecisionModelVersion** | Pointer to **string** |  | [optional] 
**DecisionModelPluginDigest** | Pointer to **string** |  | [optional] 
**SandboxOutcome** | Pointer to **string** |  | [optional] 
**RecordedAt** | **time.Time** |  | 

## Methods

### NewDecisionProvenanceRecord

`func NewDecisionProvenanceRecord(recordId string, ownerId string, briefId string, verdict string, sourceMemoryIds []string, recordedAt time.Time, ) *DecisionProvenanceRecord`

NewDecisionProvenanceRecord instantiates a new DecisionProvenanceRecord object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDecisionProvenanceRecordWithDefaults

`func NewDecisionProvenanceRecordWithDefaults() *DecisionProvenanceRecord`

NewDecisionProvenanceRecordWithDefaults instantiates a new DecisionProvenanceRecord object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRecordId

`func (o *DecisionProvenanceRecord) GetRecordId() string`

GetRecordId returns the RecordId field if non-nil, zero value otherwise.

### GetRecordIdOk

`func (o *DecisionProvenanceRecord) GetRecordIdOk() (*string, bool)`

GetRecordIdOk returns a tuple with the RecordId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRecordId

`func (o *DecisionProvenanceRecord) SetRecordId(v string)`

SetRecordId sets RecordId field to given value.


### GetOwnerId

`func (o *DecisionProvenanceRecord) GetOwnerId() string`

GetOwnerId returns the OwnerId field if non-nil, zero value otherwise.

### GetOwnerIdOk

`func (o *DecisionProvenanceRecord) GetOwnerIdOk() (*string, bool)`

GetOwnerIdOk returns a tuple with the OwnerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOwnerId

`func (o *DecisionProvenanceRecord) SetOwnerId(v string)`

SetOwnerId sets OwnerId field to given value.


### GetBriefId

`func (o *DecisionProvenanceRecord) GetBriefId() string`

GetBriefId returns the BriefId field if non-nil, zero value otherwise.

### GetBriefIdOk

`func (o *DecisionProvenanceRecord) GetBriefIdOk() (*string, bool)`

GetBriefIdOk returns a tuple with the BriefId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBriefId

`func (o *DecisionProvenanceRecord) SetBriefId(v string)`

SetBriefId sets BriefId field to given value.


### GetPackageId

`func (o *DecisionProvenanceRecord) GetPackageId() string`

GetPackageId returns the PackageId field if non-nil, zero value otherwise.

### GetPackageIdOk

`func (o *DecisionProvenanceRecord) GetPackageIdOk() (*string, bool)`

GetPackageIdOk returns a tuple with the PackageId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPackageId

`func (o *DecisionProvenanceRecord) SetPackageId(v string)`

SetPackageId sets PackageId field to given value.

### HasPackageId

`func (o *DecisionProvenanceRecord) HasPackageId() bool`

HasPackageId returns a boolean if a field has been set.

### GetVerdict

`func (o *DecisionProvenanceRecord) GetVerdict() string`

GetVerdict returns the Verdict field if non-nil, zero value otherwise.

### GetVerdictOk

`func (o *DecisionProvenanceRecord) GetVerdictOk() (*string, bool)`

GetVerdictOk returns a tuple with the Verdict field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVerdict

`func (o *DecisionProvenanceRecord) SetVerdict(v string)`

SetVerdict sets Verdict field to given value.


### GetRationale

`func (o *DecisionProvenanceRecord) GetRationale() string`

GetRationale returns the Rationale field if non-nil, zero value otherwise.

### GetRationaleOk

`func (o *DecisionProvenanceRecord) GetRationaleOk() (*string, bool)`

GetRationaleOk returns a tuple with the Rationale field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRationale

`func (o *DecisionProvenanceRecord) SetRationale(v string)`

SetRationale sets Rationale field to given value.

### HasRationale

`func (o *DecisionProvenanceRecord) HasRationale() bool`

HasRationale returns a boolean if a field has been set.

### GetSourceMemoryIds

`func (o *DecisionProvenanceRecord) GetSourceMemoryIds() []string`

GetSourceMemoryIds returns the SourceMemoryIds field if non-nil, zero value otherwise.

### GetSourceMemoryIdsOk

`func (o *DecisionProvenanceRecord) GetSourceMemoryIdsOk() (*[]string, bool)`

GetSourceMemoryIdsOk returns a tuple with the SourceMemoryIds field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSourceMemoryIds

`func (o *DecisionProvenanceRecord) SetSourceMemoryIds(v []string)`

SetSourceMemoryIds sets SourceMemoryIds field to given value.


### GetDecisionModelId

`func (o *DecisionProvenanceRecord) GetDecisionModelId() string`

GetDecisionModelId returns the DecisionModelId field if non-nil, zero value otherwise.

### GetDecisionModelIdOk

`func (o *DecisionProvenanceRecord) GetDecisionModelIdOk() (*string, bool)`

GetDecisionModelIdOk returns a tuple with the DecisionModelId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDecisionModelId

`func (o *DecisionProvenanceRecord) SetDecisionModelId(v string)`

SetDecisionModelId sets DecisionModelId field to given value.

### HasDecisionModelId

`func (o *DecisionProvenanceRecord) HasDecisionModelId() bool`

HasDecisionModelId returns a boolean if a field has been set.

### GetDecisionModelVersion

`func (o *DecisionProvenanceRecord) GetDecisionModelVersion() string`

GetDecisionModelVersion returns the DecisionModelVersion field if non-nil, zero value otherwise.

### GetDecisionModelVersionOk

`func (o *DecisionProvenanceRecord) GetDecisionModelVersionOk() (*string, bool)`

GetDecisionModelVersionOk returns a tuple with the DecisionModelVersion field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDecisionModelVersion

`func (o *DecisionProvenanceRecord) SetDecisionModelVersion(v string)`

SetDecisionModelVersion sets DecisionModelVersion field to given value.

### HasDecisionModelVersion

`func (o *DecisionProvenanceRecord) HasDecisionModelVersion() bool`

HasDecisionModelVersion returns a boolean if a field has been set.

### GetDecisionModelPluginDigest

`func (o *DecisionProvenanceRecord) GetDecisionModelPluginDigest() string`

GetDecisionModelPluginDigest returns the DecisionModelPluginDigest field if non-nil, zero value otherwise.

### GetDecisionModelPluginDigestOk

`func (o *DecisionProvenanceRecord) GetDecisionModelPluginDigestOk() (*string, bool)`

GetDecisionModelPluginDigestOk returns a tuple with the DecisionModelPluginDigest field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDecisionModelPluginDigest

`func (o *DecisionProvenanceRecord) SetDecisionModelPluginDigest(v string)`

SetDecisionModelPluginDigest sets DecisionModelPluginDigest field to given value.

### HasDecisionModelPluginDigest

`func (o *DecisionProvenanceRecord) HasDecisionModelPluginDigest() bool`

HasDecisionModelPluginDigest returns a boolean if a field has been set.

### GetSandboxOutcome

`func (o *DecisionProvenanceRecord) GetSandboxOutcome() string`

GetSandboxOutcome returns the SandboxOutcome field if non-nil, zero value otherwise.

### GetSandboxOutcomeOk

`func (o *DecisionProvenanceRecord) GetSandboxOutcomeOk() (*string, bool)`

GetSandboxOutcomeOk returns a tuple with the SandboxOutcome field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSandboxOutcome

`func (o *DecisionProvenanceRecord) SetSandboxOutcome(v string)`

SetSandboxOutcome sets SandboxOutcome field to given value.

### HasSandboxOutcome

`func (o *DecisionProvenanceRecord) HasSandboxOutcome() bool`

HasSandboxOutcome returns a boolean if a field has been set.

### GetRecordedAt

`func (o *DecisionProvenanceRecord) GetRecordedAt() time.Time`

GetRecordedAt returns the RecordedAt field if non-nil, zero value otherwise.

### GetRecordedAtOk

`func (o *DecisionProvenanceRecord) GetRecordedAtOk() (*time.Time, bool)`

GetRecordedAtOk returns a tuple with the RecordedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRecordedAt

`func (o *DecisionProvenanceRecord) SetRecordedAt(v time.Time)`

SetRecordedAt sets RecordedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


