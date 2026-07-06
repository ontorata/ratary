# BuildContextResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Context** | Pointer to **string** |  | [optional] 
**Prompt** | Pointer to **string** |  | [optional] 
**MemoryCount** | Pointer to **int32** |  | [optional] 

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


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


