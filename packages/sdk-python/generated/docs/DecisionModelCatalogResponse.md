# DecisionModelCatalogResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**models** | [**List[DecisionModelCatalogEntry]**](DecisionModelCatalogEntry.md) |  | 

## Example

```python
from ratary_sdk.models.decision_model_catalog_response import DecisionModelCatalogResponse

# TODO update the JSON string below
json = "{}"
# create an instance of DecisionModelCatalogResponse from a JSON string
decision_model_catalog_response_instance = DecisionModelCatalogResponse.from_json(json)
# print the JSON string representation of the object
print(DecisionModelCatalogResponse.to_json())

# convert the object into a dict
decision_model_catalog_response_dict = decision_model_catalog_response_instance.to_dict()
# create an instance of DecisionModelCatalogResponse from a dict
decision_model_catalog_response_from_dict = DecisionModelCatalogResponse.from_dict(decision_model_catalog_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


