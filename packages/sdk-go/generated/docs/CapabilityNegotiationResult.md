# CapabilityNegotiationResult

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Compatible** | **bool** |  | 
**NegotiatedProtocolVersion** | **string** |  | 
**ServerProtocolVersion** | **string** |  | 
**SupportedProtocolVersions** | **[]string** |  | 
**Matched** | [**CapabilityMatchGroups**](CapabilityMatchGroups.md) |  | 
**Missing** | [**CapabilityMatchGroups**](CapabilityMatchGroups.md) |  | 
**ServerEnabledCapabilities** | **[]string** |  | 
**CapabilitiesUrl** | **string** |  | 
**NegotiateUrl** | **string** |  | 
**Timestamp** | **time.Time** |  | 

## Methods

### NewCapabilityNegotiationResult

`func NewCapabilityNegotiationResult(compatible bool, negotiatedProtocolVersion string, serverProtocolVersion string, supportedProtocolVersions []string, matched CapabilityMatchGroups, missing CapabilityMatchGroups, serverEnabledCapabilities []string, capabilitiesUrl string, negotiateUrl string, timestamp time.Time, ) *CapabilityNegotiationResult`

NewCapabilityNegotiationResult instantiates a new CapabilityNegotiationResult object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCapabilityNegotiationResultWithDefaults

`func NewCapabilityNegotiationResultWithDefaults() *CapabilityNegotiationResult`

NewCapabilityNegotiationResultWithDefaults instantiates a new CapabilityNegotiationResult object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCompatible

`func (o *CapabilityNegotiationResult) GetCompatible() bool`

GetCompatible returns the Compatible field if non-nil, zero value otherwise.

### GetCompatibleOk

`func (o *CapabilityNegotiationResult) GetCompatibleOk() (*bool, bool)`

GetCompatibleOk returns a tuple with the Compatible field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCompatible

`func (o *CapabilityNegotiationResult) SetCompatible(v bool)`

SetCompatible sets Compatible field to given value.


### GetNegotiatedProtocolVersion

`func (o *CapabilityNegotiationResult) GetNegotiatedProtocolVersion() string`

GetNegotiatedProtocolVersion returns the NegotiatedProtocolVersion field if non-nil, zero value otherwise.

### GetNegotiatedProtocolVersionOk

`func (o *CapabilityNegotiationResult) GetNegotiatedProtocolVersionOk() (*string, bool)`

GetNegotiatedProtocolVersionOk returns a tuple with the NegotiatedProtocolVersion field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNegotiatedProtocolVersion

`func (o *CapabilityNegotiationResult) SetNegotiatedProtocolVersion(v string)`

SetNegotiatedProtocolVersion sets NegotiatedProtocolVersion field to given value.


### GetServerProtocolVersion

`func (o *CapabilityNegotiationResult) GetServerProtocolVersion() string`

GetServerProtocolVersion returns the ServerProtocolVersion field if non-nil, zero value otherwise.

### GetServerProtocolVersionOk

`func (o *CapabilityNegotiationResult) GetServerProtocolVersionOk() (*string, bool)`

GetServerProtocolVersionOk returns a tuple with the ServerProtocolVersion field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetServerProtocolVersion

`func (o *CapabilityNegotiationResult) SetServerProtocolVersion(v string)`

SetServerProtocolVersion sets ServerProtocolVersion field to given value.


### GetSupportedProtocolVersions

`func (o *CapabilityNegotiationResult) GetSupportedProtocolVersions() []string`

GetSupportedProtocolVersions returns the SupportedProtocolVersions field if non-nil, zero value otherwise.

### GetSupportedProtocolVersionsOk

`func (o *CapabilityNegotiationResult) GetSupportedProtocolVersionsOk() (*[]string, bool)`

GetSupportedProtocolVersionsOk returns a tuple with the SupportedProtocolVersions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSupportedProtocolVersions

`func (o *CapabilityNegotiationResult) SetSupportedProtocolVersions(v []string)`

SetSupportedProtocolVersions sets SupportedProtocolVersions field to given value.


### GetMatched

`func (o *CapabilityNegotiationResult) GetMatched() CapabilityMatchGroups`

GetMatched returns the Matched field if non-nil, zero value otherwise.

### GetMatchedOk

`func (o *CapabilityNegotiationResult) GetMatchedOk() (*CapabilityMatchGroups, bool)`

GetMatchedOk returns a tuple with the Matched field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMatched

`func (o *CapabilityNegotiationResult) SetMatched(v CapabilityMatchGroups)`

SetMatched sets Matched field to given value.


### GetMissing

`func (o *CapabilityNegotiationResult) GetMissing() CapabilityMatchGroups`

GetMissing returns the Missing field if non-nil, zero value otherwise.

### GetMissingOk

`func (o *CapabilityNegotiationResult) GetMissingOk() (*CapabilityMatchGroups, bool)`

GetMissingOk returns a tuple with the Missing field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMissing

`func (o *CapabilityNegotiationResult) SetMissing(v CapabilityMatchGroups)`

SetMissing sets Missing field to given value.


### GetServerEnabledCapabilities

`func (o *CapabilityNegotiationResult) GetServerEnabledCapabilities() []string`

GetServerEnabledCapabilities returns the ServerEnabledCapabilities field if non-nil, zero value otherwise.

### GetServerEnabledCapabilitiesOk

`func (o *CapabilityNegotiationResult) GetServerEnabledCapabilitiesOk() (*[]string, bool)`

GetServerEnabledCapabilitiesOk returns a tuple with the ServerEnabledCapabilities field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetServerEnabledCapabilities

`func (o *CapabilityNegotiationResult) SetServerEnabledCapabilities(v []string)`

SetServerEnabledCapabilities sets ServerEnabledCapabilities field to given value.


### GetCapabilitiesUrl

`func (o *CapabilityNegotiationResult) GetCapabilitiesUrl() string`

GetCapabilitiesUrl returns the CapabilitiesUrl field if non-nil, zero value otherwise.

### GetCapabilitiesUrlOk

`func (o *CapabilityNegotiationResult) GetCapabilitiesUrlOk() (*string, bool)`

GetCapabilitiesUrlOk returns a tuple with the CapabilitiesUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCapabilitiesUrl

`func (o *CapabilityNegotiationResult) SetCapabilitiesUrl(v string)`

SetCapabilitiesUrl sets CapabilitiesUrl field to given value.


### GetNegotiateUrl

`func (o *CapabilityNegotiationResult) GetNegotiateUrl() string`

GetNegotiateUrl returns the NegotiateUrl field if non-nil, zero value otherwise.

### GetNegotiateUrlOk

`func (o *CapabilityNegotiationResult) GetNegotiateUrlOk() (*string, bool)`

GetNegotiateUrlOk returns a tuple with the NegotiateUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNegotiateUrl

`func (o *CapabilityNegotiationResult) SetNegotiateUrl(v string)`

SetNegotiateUrl sets NegotiateUrl field to given value.


### GetTimestamp

`func (o *CapabilityNegotiationResult) GetTimestamp() time.Time`

GetTimestamp returns the Timestamp field if non-nil, zero value otherwise.

### GetTimestampOk

`func (o *CapabilityNegotiationResult) GetTimestampOk() (*time.Time, bool)`

GetTimestampOk returns a tuple with the Timestamp field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTimestamp

`func (o *CapabilityNegotiationResult) SetTimestamp(v time.Time)`

SetTimestamp sets Timestamp field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


