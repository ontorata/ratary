# RecordDecisionProvenance201Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**record** | [**DecisionProvenanceRecord**](DecisionProvenanceRecord.md) |  | [optional] 

## Example

```python
from ratary_sdk.models.record_decision_provenance201_response import RecordDecisionProvenance201Response

# TODO update the JSON string below
json = "{}"
# create an instance of RecordDecisionProvenance201Response from a JSON string
record_decision_provenance201_response_instance = RecordDecisionProvenance201Response.from_json(json)
# print the JSON string representation of the object
print(RecordDecisionProvenance201Response.to_json())

# convert the object into a dict
record_decision_provenance201_response_dict = record_decision_provenance201_response_instance.to_dict()
# create an instance of RecordDecisionProvenance201Response from a dict
record_decision_provenance201_response_from_dict = RecordDecisionProvenance201Response.from_dict(record_decision_provenance201_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


