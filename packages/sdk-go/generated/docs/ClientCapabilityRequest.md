# ClientCapabilityRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ProtocolVersion** | Pointer to **string** |  | [optional] 
**ClientInfo** | Pointer to [**ClientCapabilityRequestClientInfo**](ClientCapabilityRequestClientInfo.md) |  | [optional] 
**RequiredCapabilities** | Pointer to **[]string** |  | [optional] 
**PreferredCapabilities** | Pointer to **[]string** |  | [optional] 
**Transports** | Pointer to **[]string** |  | [optional] 

## Methods

### NewClientCapabilityRequest

`func NewClientCapabilityRequest() *ClientCapabilityRequest`

NewClientCapabilityRequest instantiates a new ClientCapabilityRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewClientCapabilityRequestWithDefaults

`func NewClientCapabilityRequestWithDefaults() *ClientCapabilityRequest`

NewClientCapabilityRequestWithDefaults instantiates a new ClientCapabilityRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetProtocolVersion

`func (o *ClientCapabilityRequest) GetProtocolVersion() string`

GetProtocolVersion returns the ProtocolVersion field if non-nil, zero value otherwise.

### GetProtocolVersionOk

`func (o *ClientCapabilityRequest) GetProtocolVersionOk() (*string, bool)`

GetProtocolVersionOk returns a tuple with the ProtocolVersion field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProtocolVersion

`func (o *ClientCapabilityRequest) SetProtocolVersion(v string)`

SetProtocolVersion sets ProtocolVersion field to given value.

### HasProtocolVersion

`func (o *ClientCapabilityRequest) HasProtocolVersion() bool`

HasProtocolVersion returns a boolean if a field has been set.

### GetClientInfo

`func (o *ClientCapabilityRequest) GetClientInfo() ClientCapabilityRequestClientInfo`

GetClientInfo returns the ClientInfo field if non-nil, zero value otherwise.

### GetClientInfoOk

`func (o *ClientCapabilityRequest) GetClientInfoOk() (*ClientCapabilityRequestClientInfo, bool)`

GetClientInfoOk returns a tuple with the ClientInfo field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetClientInfo

`func (o *ClientCapabilityRequest) SetClientInfo(v ClientCapabilityRequestClientInfo)`

SetClientInfo sets ClientInfo field to given value.

### HasClientInfo

`func (o *ClientCapabilityRequest) HasClientInfo() bool`

HasClientInfo returns a boolean if a field has been set.

### GetRequiredCapabilities

`func (o *ClientCapabilityRequest) GetRequiredCapabilities() []string`

GetRequiredCapabilities returns the RequiredCapabilities field if non-nil, zero value otherwise.

### GetRequiredCapabilitiesOk

`func (o *ClientCapabilityRequest) GetRequiredCapabilitiesOk() (*[]string, bool)`

GetRequiredCapabilitiesOk returns a tuple with the RequiredCapabilities field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRequiredCapabilities

`func (o *ClientCapabilityRequest) SetRequiredCapabilities(v []string)`

SetRequiredCapabilities sets RequiredCapabilities field to given value.

### HasRequiredCapabilities

`func (o *ClientCapabilityRequest) HasRequiredCapabilities() bool`

HasRequiredCapabilities returns a boolean if a field has been set.

### GetPreferredCapabilities

`func (o *ClientCapabilityRequest) GetPreferredCapabilities() []string`

GetPreferredCapabilities returns the PreferredCapabilities field if non-nil, zero value otherwise.

### GetPreferredCapabilitiesOk

`func (o *ClientCapabilityRequest) GetPreferredCapabilitiesOk() (*[]string, bool)`

GetPreferredCapabilitiesOk returns a tuple with the PreferredCapabilities field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPreferredCapabilities

`func (o *ClientCapabilityRequest) SetPreferredCapabilities(v []string)`

SetPreferredCapabilities sets PreferredCapabilities field to given value.

### HasPreferredCapabilities

`func (o *ClientCapabilityRequest) HasPreferredCapabilities() bool`

HasPreferredCapabilities returns a boolean if a field has been set.

### GetTransports

`func (o *ClientCapabilityRequest) GetTransports() []string`

GetTransports returns the Transports field if non-nil, zero value otherwise.

### GetTransportsOk

`func (o *ClientCapabilityRequest) GetTransportsOk() (*[]string, bool)`

GetTransportsOk returns a tuple with the Transports field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTransports

`func (o *ClientCapabilityRequest) SetTransports(v []string)`

SetTransports sets Transports field to given value.

### HasTransports

`func (o *ClientCapabilityRequest) HasTransports() bool`

HasTransports returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


