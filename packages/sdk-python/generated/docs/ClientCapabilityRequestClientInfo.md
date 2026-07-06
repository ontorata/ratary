# ClientCapabilityRequestClientInfo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**version** | **str** |  | 

## Example

```python
from ratary_sdk.models.client_capability_request_client_info import ClientCapabilityRequestClientInfo

# TODO update the JSON string below
json = "{}"
# create an instance of ClientCapabilityRequestClientInfo from a JSON string
client_capability_request_client_info_instance = ClientCapabilityRequestClientInfo.from_json(json)
# print the JSON string representation of the object
print(ClientCapabilityRequestClientInfo.to_json())

# convert the object into a dict
client_capability_request_client_info_dict = client_capability_request_client_info_instance.to_dict()
# create an instance of ClientCapabilityRequestClientInfo from a dict
client_capability_request_client_info_from_dict = ClientCapabilityRequestClientInfo.from_dict(client_capability_request_client_info_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


