# Memory

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | Pointer to **string** |  | [optional] 
**Title** | Pointer to **string** |  | [optional] 
**Content** | Pointer to **string** |  | [optional] 
**Summary** | Pointer to **string** |  | [optional] 
**Project** | Pointer to **string** |  | [optional] 
**Tags** | Pointer to **[]string** |  | [optional] 
**Favorite** | Pointer to **bool** |  | [optional] 
**Archived** | Pointer to **bool** |  | [optional] 
**LifecycleState** | Pointer to **string** | Optional stewardship lifecycle hint when set | [optional] 
**CreatedAt** | Pointer to **time.Time** |  | [optional] 
**UpdatedAt** | Pointer to **time.Time** |  | [optional] 

## Methods

### NewMemory

`func NewMemory() *Memory`

NewMemory instantiates a new Memory object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewMemoryWithDefaults

`func NewMemoryWithDefaults() *Memory`

NewMemoryWithDefaults instantiates a new Memory object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *Memory) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *Memory) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *Memory) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *Memory) HasId() bool`

HasId returns a boolean if a field has been set.

### GetTitle

`func (o *Memory) GetTitle() string`

GetTitle returns the Title field if non-nil, zero value otherwise.

### GetTitleOk

`func (o *Memory) GetTitleOk() (*string, bool)`

GetTitleOk returns a tuple with the Title field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTitle

`func (o *Memory) SetTitle(v string)`

SetTitle sets Title field to given value.

### HasTitle

`func (o *Memory) HasTitle() bool`

HasTitle returns a boolean if a field has been set.

### GetContent

`func (o *Memory) GetContent() string`

GetContent returns the Content field if non-nil, zero value otherwise.

### GetContentOk

`func (o *Memory) GetContentOk() (*string, bool)`

GetContentOk returns a tuple with the Content field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetContent

`func (o *Memory) SetContent(v string)`

SetContent sets Content field to given value.

### HasContent

`func (o *Memory) HasContent() bool`

HasContent returns a boolean if a field has been set.

### GetSummary

`func (o *Memory) GetSummary() string`

GetSummary returns the Summary field if non-nil, zero value otherwise.

### GetSummaryOk

`func (o *Memory) GetSummaryOk() (*string, bool)`

GetSummaryOk returns a tuple with the Summary field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSummary

`func (o *Memory) SetSummary(v string)`

SetSummary sets Summary field to given value.

### HasSummary

`func (o *Memory) HasSummary() bool`

HasSummary returns a boolean if a field has been set.

### GetProject

`func (o *Memory) GetProject() string`

GetProject returns the Project field if non-nil, zero value otherwise.

### GetProjectOk

`func (o *Memory) GetProjectOk() (*string, bool)`

GetProjectOk returns a tuple with the Project field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProject

`func (o *Memory) SetProject(v string)`

SetProject sets Project field to given value.

### HasProject

`func (o *Memory) HasProject() bool`

HasProject returns a boolean if a field has been set.

### GetTags

`func (o *Memory) GetTags() []string`

GetTags returns the Tags field if non-nil, zero value otherwise.

### GetTagsOk

`func (o *Memory) GetTagsOk() (*[]string, bool)`

GetTagsOk returns a tuple with the Tags field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTags

`func (o *Memory) SetTags(v []string)`

SetTags sets Tags field to given value.

### HasTags

`func (o *Memory) HasTags() bool`

HasTags returns a boolean if a field has been set.

### GetFavorite

`func (o *Memory) GetFavorite() bool`

GetFavorite returns the Favorite field if non-nil, zero value otherwise.

### GetFavoriteOk

`func (o *Memory) GetFavoriteOk() (*bool, bool)`

GetFavoriteOk returns a tuple with the Favorite field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFavorite

`func (o *Memory) SetFavorite(v bool)`

SetFavorite sets Favorite field to given value.

### HasFavorite

`func (o *Memory) HasFavorite() bool`

HasFavorite returns a boolean if a field has been set.

### GetArchived

`func (o *Memory) GetArchived() bool`

GetArchived returns the Archived field if non-nil, zero value otherwise.

### GetArchivedOk

`func (o *Memory) GetArchivedOk() (*bool, bool)`

GetArchivedOk returns a tuple with the Archived field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetArchived

`func (o *Memory) SetArchived(v bool)`

SetArchived sets Archived field to given value.

### HasArchived

`func (o *Memory) HasArchived() bool`

HasArchived returns a boolean if a field has been set.

### GetLifecycleState

`func (o *Memory) GetLifecycleState() string`

GetLifecycleState returns the LifecycleState field if non-nil, zero value otherwise.

### GetLifecycleStateOk

`func (o *Memory) GetLifecycleStateOk() (*string, bool)`

GetLifecycleStateOk returns a tuple with the LifecycleState field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLifecycleState

`func (o *Memory) SetLifecycleState(v string)`

SetLifecycleState sets LifecycleState field to given value.

### HasLifecycleState

`func (o *Memory) HasLifecycleState() bool`

HasLifecycleState returns a boolean if a field has been set.

### GetCreatedAt

`func (o *Memory) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *Memory) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *Memory) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.

### HasCreatedAt

`func (o *Memory) HasCreatedAt() bool`

HasCreatedAt returns a boolean if a field has been set.

### GetUpdatedAt

`func (o *Memory) GetUpdatedAt() time.Time`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *Memory) GetUpdatedAtOk() (*time.Time, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *Memory) SetUpdatedAt(v time.Time)`

SetUpdatedAt sets UpdatedAt field to given value.

### HasUpdatedAt

`func (o *Memory) HasUpdatedAt() bool`

HasUpdatedAt returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


