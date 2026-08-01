# ListPolicyDenials200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Denials** | Pointer to [**[]PolicyDenialEvent**](PolicyDenialEvent.md) |  | [optional] 

## Methods

### NewListPolicyDenials200Response

`func NewListPolicyDenials200Response() *ListPolicyDenials200Response`

NewListPolicyDenials200Response instantiates a new ListPolicyDenials200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListPolicyDenials200ResponseWithDefaults

`func NewListPolicyDenials200ResponseWithDefaults() *ListPolicyDenials200Response`

NewListPolicyDenials200ResponseWithDefaults instantiates a new ListPolicyDenials200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDenials

`func (o *ListPolicyDenials200Response) GetDenials() []PolicyDenialEvent`

GetDenials returns the Denials field if non-nil, zero value otherwise.

### GetDenialsOk

`func (o *ListPolicyDenials200Response) GetDenialsOk() (*[]PolicyDenialEvent, bool)`

GetDenialsOk returns a tuple with the Denials field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDenials

`func (o *ListPolicyDenials200Response) SetDenials(v []PolicyDenialEvent)`

SetDenials sets Denials field to given value.

### HasDenials

`func (o *ListPolicyDenials200Response) HasDenials() bool`

HasDenials returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


