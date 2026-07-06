# CreateMemoryRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Title** | **string** |  | 
**Content** | **string** |  | 
**Summary** | Pointer to **string** |  | [optional] 
**Project** | Pointer to **string** |  | [optional] 
**Tags** | Pointer to **[]string** |  | [optional] 

## Methods

### NewCreateMemoryRequest

`func NewCreateMemoryRequest(title string, content string, ) *CreateMemoryRequest`

NewCreateMemoryRequest instantiates a new CreateMemoryRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateMemoryRequestWithDefaults

`func NewCreateMemoryRequestWithDefaults() *CreateMemoryRequest`

NewCreateMemoryRequestWithDefaults instantiates a new CreateMemoryRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTitle

`func (o *CreateMemoryRequest) GetTitle() string`

GetTitle returns the Title field if non-nil, zero value otherwise.

### GetTitleOk

`func (o *CreateMemoryRequest) GetTitleOk() (*string, bool)`

GetTitleOk returns a tuple with the Title field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTitle

`func (o *CreateMemoryRequest) SetTitle(v string)`

SetTitle sets Title field to given value.


### GetContent

`func (o *CreateMemoryRequest) GetContent() string`

GetContent returns the Content field if non-nil, zero value otherwise.

### GetContentOk

`func (o *CreateMemoryRequest) GetContentOk() (*string, bool)`

GetContentOk returns a tuple with the Content field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetContent

`func (o *CreateMemoryRequest) SetContent(v string)`

SetContent sets Content field to given value.


### GetSummary

`func (o *CreateMemoryRequest) GetSummary() string`

GetSummary returns the Summary field if non-nil, zero value otherwise.

### GetSummaryOk

`func (o *CreateMemoryRequest) GetSummaryOk() (*string, bool)`

GetSummaryOk returns a tuple with the Summary field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSummary

`func (o *CreateMemoryRequest) SetSummary(v string)`

SetSummary sets Summary field to given value.

### HasSummary

`func (o *CreateMemoryRequest) HasSummary() bool`

HasSummary returns a boolean if a field has been set.

### GetProject

`func (o *CreateMemoryRequest) GetProject() string`

GetProject returns the Project field if non-nil, zero value otherwise.

### GetProjectOk

`func (o *CreateMemoryRequest) GetProjectOk() (*string, bool)`

GetProjectOk returns a tuple with the Project field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProject

`func (o *CreateMemoryRequest) SetProject(v string)`

SetProject sets Project field to given value.

### HasProject

`func (o *CreateMemoryRequest) HasProject() bool`

HasProject returns a boolean if a field has been set.

### GetTags

`func (o *CreateMemoryRequest) GetTags() []string`

GetTags returns the Tags field if non-nil, zero value otherwise.

### GetTagsOk

`func (o *CreateMemoryRequest) GetTagsOk() (*[]string, bool)`

GetTagsOk returns a tuple with the Tags field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTags

`func (o *CreateMemoryRequest) SetTags(v []string)`

SetTags sets Tags field to given value.

### HasTags

`func (o *CreateMemoryRequest) HasTags() bool`

HasTags returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


