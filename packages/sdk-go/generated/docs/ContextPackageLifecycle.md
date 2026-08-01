# ContextPackageLifecycle

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**PackageId** | **string** |  | 
**OwnerId** | **string** |  | 
**LifecycleState** | **string** |  | 
**CreatedAt** | **time.Time** |  | 
**UpdatedAt** | **time.Time** |  | 

## Methods

### NewContextPackageLifecycle

`func NewContextPackageLifecycle(packageId string, ownerId string, lifecycleState string, createdAt time.Time, updatedAt time.Time, ) *ContextPackageLifecycle`

NewContextPackageLifecycle instantiates a new ContextPackageLifecycle object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewContextPackageLifecycleWithDefaults

`func NewContextPackageLifecycleWithDefaults() *ContextPackageLifecycle`

NewContextPackageLifecycleWithDefaults instantiates a new ContextPackageLifecycle object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPackageId

`func (o *ContextPackageLifecycle) GetPackageId() string`

GetPackageId returns the PackageId field if non-nil, zero value otherwise.

### GetPackageIdOk

`func (o *ContextPackageLifecycle) GetPackageIdOk() (*string, bool)`

GetPackageIdOk returns a tuple with the PackageId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPackageId

`func (o *ContextPackageLifecycle) SetPackageId(v string)`

SetPackageId sets PackageId field to given value.


### GetOwnerId

`func (o *ContextPackageLifecycle) GetOwnerId() string`

GetOwnerId returns the OwnerId field if non-nil, zero value otherwise.

### GetOwnerIdOk

`func (o *ContextPackageLifecycle) GetOwnerIdOk() (*string, bool)`

GetOwnerIdOk returns a tuple with the OwnerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOwnerId

`func (o *ContextPackageLifecycle) SetOwnerId(v string)`

SetOwnerId sets OwnerId field to given value.


### GetLifecycleState

`func (o *ContextPackageLifecycle) GetLifecycleState() string`

GetLifecycleState returns the LifecycleState field if non-nil, zero value otherwise.

### GetLifecycleStateOk

`func (o *ContextPackageLifecycle) GetLifecycleStateOk() (*string, bool)`

GetLifecycleStateOk returns a tuple with the LifecycleState field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLifecycleState

`func (o *ContextPackageLifecycle) SetLifecycleState(v string)`

SetLifecycleState sets LifecycleState field to given value.


### GetCreatedAt

`func (o *ContextPackageLifecycle) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *ContextPackageLifecycle) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *ContextPackageLifecycle) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.


### GetUpdatedAt

`func (o *ContextPackageLifecycle) GetUpdatedAt() time.Time`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *ContextPackageLifecycle) GetUpdatedAtOk() (*time.Time, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *ContextPackageLifecycle) SetUpdatedAt(v time.Time)`

SetUpdatedAt sets UpdatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


