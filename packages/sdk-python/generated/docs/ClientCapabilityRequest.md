# ClientCapabilityRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**protocol_version** | **str** |  | [optional] 
**client_info** | [**ClientCapabilityRequestClientInfo**](ClientCapabilityRequestClientInfo.md) |  | [optional] 
**required_capabilities** | **List[str]** |  | [optional] 
**preferred_capabilities** | **List[str]** |  | [optional] 
**transports** | **List[str]** |  | [optional] 

## Example

```python
from ratary_sdk.models.client_capability_request import ClientCapabilityRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ClientCapabilityRequest from a JSON string
client_capability_request_instance = ClientCapabilityRequest.from_json(json)
# print the JSON string representation of the object
print(ClientCapabilityRequest.to_json())

# convert the object into a dict
client_capability_request_dict = client_capability_request_instance.to_dict()
# create an instance of ClientCapabilityRequest from a dict
client_capability_request_from_dict = ClientCapabilityRequest.from_dict(client_capability_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


