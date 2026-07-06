# BuildContextRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Task** | **string** |  | 
**MaxTokens** | Pointer to **int32** |  | [optional] 
**Project** | Pointer to **string** |  | [optional] 

## Methods

### NewBuildContextRequest

`func NewBuildContextRequest(task string, ) *BuildContextRequest`

NewBuildContextRequest instantiates a new BuildContextRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewBuildContextRequestWithDefaults

`func NewBuildContextRequestWithDefaults() *BuildContextRequest`

NewBuildContextRequestWithDefaults instantiates a new BuildContextRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTask

`func (o *BuildContextRequest) GetTask() string`

GetTask returns the Task field if non-nil, zero value otherwise.

### GetTaskOk

`func (o *BuildContextRequest) GetTaskOk() (*string, bool)`

GetTaskOk returns a tuple with the Task field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTask

`func (o *BuildContextRequest) SetTask(v string)`

SetTask sets Task field to given value.


### GetMaxTokens

`func (o *BuildContextRequest) GetMaxTokens() int32`

GetMaxTokens returns the MaxTokens field if non-nil, zero value otherwise.

### GetMaxTokensOk

`func (o *BuildContextRequest) GetMaxTokensOk() (*int32, bool)`

GetMaxTokensOk returns a tuple with the MaxTokens field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxTokens

`func (o *BuildContextRequest) SetMaxTokens(v int32)`

SetMaxTokens sets MaxTokens field to given value.

### HasMaxTokens

`func (o *BuildContextRequest) HasMaxTokens() bool`

HasMaxTokens returns a boolean if a field has been set.

### GetProject

`func (o *BuildContextRequest) GetProject() string`

GetProject returns the Project field if non-nil, zero value otherwise.

### GetProjectOk

`func (o *BuildContextRequest) GetProjectOk() (*string, bool)`

GetProjectOk returns a tuple with the Project field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProject

`func (o *BuildContextRequest) SetProject(v string)`

SetProject sets Project field to given value.

### HasProject

`func (o *BuildContextRequest) HasProject() bool`

HasProject returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


