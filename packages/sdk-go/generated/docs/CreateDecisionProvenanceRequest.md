# CreateDecisionProvenanceRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**BriefId** | **string** |  | 
**PackageId** | Pointer to **string** |  | [optional] 
**Verdict** | **string** |  | 
**Rationale** | Pointer to **string** |  | [optional] 
**SourceMemoryIds** | Pointer to **[]string** |  | [optional] 
**DecisionModelId** | Pointer to **string** |  | [optional] 
**DecisionModelVersion** | Pointer to **string** |  | [optional] 
**DecisionModelPluginDigest** | Pointer to **string** |  | [optional] 
**SandboxOutcome** | Pointer to **string** |  | [optional] 

## Methods

### NewCreateDecisionProvenanceRequest

`func NewCreateDecisionProvenanceRequest(briefId string, verdict string, ) *CreateDecisionProvenanceRequest`

NewCreateDecisionProvenanceRequest instantiates a new CreateDecisionProvenanceRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateDecisionProvenanceRequestWithDefaults

`func NewCreateDecisionProvenanceRequestWithDefaults() *CreateDecisionProvenanceRequest`

NewCreateDecisionProvenanceRequestWithDefaults instantiates a new CreateDecisionProvenanceRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBriefId

`func (o *CreateDecisionProvenanceRequest) GetBriefId() string`

GetBriefId returns the BriefId field if non-nil, zero value otherwise.

### GetBriefIdOk

`func (o *CreateDecisionProvenanceRequest) GetBriefIdOk() (*string, bool)`

GetBriefIdOk returns a tuple with the BriefId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBriefId

`func (o *CreateDecisionProvenanceRequest) SetBriefId(v string)`

SetBriefId sets BriefId field to given value.


### GetPackageId

`func (o *CreateDecisionProvenanceRequest) GetPackageId() string`

GetPackageId returns the PackageId field if non-nil, zero value otherwise.

### GetPackageIdOk

`func (o *CreateDecisionProvenanceRequest) GetPackageIdOk() (*string, bool)`

GetPackageIdOk returns a tuple with the PackageId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPackageId

`func (o *CreateDecisionProvenanceRequest) SetPackageId(v string)`

SetPackageId sets PackageId field to given value.

### HasPackageId

`func (o *CreateDecisionProvenanceRequest) HasPackageId() bool`

HasPackageId returns a boolean if a field has been set.

### GetVerdict

`func (o *CreateDecisionProvenanceRequest) GetVerdict() string`

GetVerdict returns the Verdict field if non-nil, zero value otherwise.

### GetVerdictOk

`func (o *CreateDecisionProvenanceRequest) GetVerdictOk() (*string, bool)`

GetVerdictOk returns a tuple with the Verdict field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVerdict

`func (o *CreateDecisionProvenanceRequest) SetVerdict(v string)`

SetVerdict sets Verdict field to given value.


### GetRationale

`func (o *CreateDecisionProvenanceRequest) GetRationale() string`

GetRationale returns the Rationale field if non-nil, zero value otherwise.

### GetRationaleOk

`func (o *CreateDecisionProvenanceRequest) GetRationaleOk() (*string, bool)`

GetRationaleOk returns a tuple with the Rationale field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRationale

`func (o *CreateDecisionProvenanceRequest) SetRationale(v string)`

SetRationale sets Rationale field to given value.

### HasRationale

`func (o *CreateDecisionProvenanceRequest) HasRationale() bool`

HasRationale returns a boolean if a field has been set.

### GetSourceMemoryIds

`func (o *CreateDecisionProvenanceRequest) GetSourceMemoryIds() []string`

GetSourceMemoryIds returns the SourceMemoryIds field if non-nil, zero value otherwise.

### GetSourceMemoryIdsOk

`func (o *CreateDecisionProvenanceRequest) GetSourceMemoryIdsOk() (*[]string, bool)`

GetSourceMemoryIdsOk returns a tuple with the SourceMemoryIds field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSourceMemoryIds

`func (o *CreateDecisionProvenanceRequest) SetSourceMemoryIds(v []string)`

SetSourceMemoryIds sets SourceMemoryIds field to given value.

### HasSourceMemoryIds

`func (o *CreateDecisionProvenanceRequest) HasSourceMemoryIds() bool`

HasSourceMemoryIds returns a boolean if a field has been set.

### GetDecisionModelId

`func (o *CreateDecisionProvenanceRequest) GetDecisionModelId() string`

GetDecisionModelId returns the DecisionModelId field if non-nil, zero value otherwise.

### GetDecisionModelIdOk

`func (o *CreateDecisionProvenanceRequest) GetDecisionModelIdOk() (*string, bool)`

GetDecisionModelIdOk returns a tuple with the DecisionModelId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDecisionModelId

`func (o *CreateDecisionProvenanceRequest) SetDecisionModelId(v string)`

SetDecisionModelId sets DecisionModelId field to given value.

### HasDecisionModelId

`func (o *CreateDecisionProvenanceRequest) HasDecisionModelId() bool`

HasDecisionModelId returns a boolean if a field has been set.

### GetDecisionModelVersion

`func (o *CreateDecisionProvenanceRequest) GetDecisionModelVersion() string`

GetDecisionModelVersion returns the DecisionModelVersion field if non-nil, zero value otherwise.

### GetDecisionModelVersionOk

`func (o *CreateDecisionProvenanceRequest) GetDecisionModelVersionOk() (*string, bool)`

GetDecisionModelVersionOk returns a tuple with the DecisionModelVersion field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDecisionModelVersion

`func (o *CreateDecisionProvenanceRequest) SetDecisionModelVersion(v string)`

SetDecisionModelVersion sets DecisionModelVersion field to given value.

### HasDecisionModelVersion

`func (o *CreateDecisionProvenanceRequest) HasDecisionModelVersion() bool`

HasDecisionModelVersion returns a boolean if a field has been set.

### GetDecisionModelPluginDigest

`func (o *CreateDecisionProvenanceRequest) GetDecisionModelPluginDigest() string`

GetDecisionModelPluginDigest returns the DecisionModelPluginDigest field if non-nil, zero value otherwise.

### GetDecisionModelPluginDigestOk

`func (o *CreateDecisionProvenanceRequest) GetDecisionModelPluginDigestOk() (*string, bool)`

GetDecisionModelPluginDigestOk returns a tuple with the DecisionModelPluginDigest field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDecisionModelPluginDigest

`func (o *CreateDecisionProvenanceRequest) SetDecisionModelPluginDigest(v string)`

SetDecisionModelPluginDigest sets DecisionModelPluginDigest field to given value.

### HasDecisionModelPluginDigest

`func (o *CreateDecisionProvenanceRequest) HasDecisionModelPluginDigest() bool`

HasDecisionModelPluginDigest returns a boolean if a field has been set.

### GetSandboxOutcome

`func (o *CreateDecisionProvenanceRequest) GetSandboxOutcome() string`

GetSandboxOutcome returns the SandboxOutcome field if non-nil, zero value otherwise.

### GetSandboxOutcomeOk

`func (o *CreateDecisionProvenanceRequest) GetSandboxOutcomeOk() (*string, bool)`

GetSandboxOutcomeOk returns a tuple with the SandboxOutcome field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSandboxOutcome

`func (o *CreateDecisionProvenanceRequest) SetSandboxOutcome(v string)`

SetSandboxOutcome sets SandboxOutcome field to given value.

### HasSandboxOutcome

`func (o *CreateDecisionProvenanceRequest) HasSandboxOutcome() bool`

HasSandboxOutcome returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


