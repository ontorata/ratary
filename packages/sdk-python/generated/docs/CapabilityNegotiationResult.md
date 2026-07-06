# CapabilityNegotiationResult


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**compatible** | **bool** |  | 
**negotiated_protocol_version** | **str** |  | 
**server_protocol_version** | **str** |  | 
**supported_protocol_versions** | **List[str]** |  | 
**matched** | [**CapabilityMatchGroups**](CapabilityMatchGroups.md) |  | 
**missing** | [**CapabilityMatchGroups**](CapabilityMatchGroups.md) |  | 
**server_enabled_capabilities** | **List[str]** |  | 
**capabilities_url** | **str** |  | 
**negotiate_url** | **str** |  | 
**timestamp** | **datetime** |  | 

## Example

```python
from ratary_sdk.models.capability_negotiation_result import CapabilityNegotiationResult

# TODO update the JSON string below
json = "{}"
# create an instance of CapabilityNegotiationResult from a JSON string
capability_negotiation_result_instance = CapabilityNegotiationResult.from_json(json)
# print the JSON string representation of the object
print(CapabilityNegotiationResult.to_json())

# convert the object into a dict
capability_negotiation_result_dict = capability_negotiation_result_instance.to_dict()
# create an instance of CapabilityNegotiationResult from a dict
capability_negotiation_result_from_dict = CapabilityNegotiationResult.from_dict(capability_negotiation_result_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


