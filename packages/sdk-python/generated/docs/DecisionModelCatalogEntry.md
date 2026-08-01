# DecisionModelCatalogEntry


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** |  | 
**version** | **str** |  | 
**display_name** | **str** |  | 
**description** | **str** |  | [optional] 
**stability** | **str** |  | 
**execution_profile_name** | **str** |  | 
**capabilities** | **List[str]** |  | 

## Example

```python
from ratary_sdk.models.decision_model_catalog_entry import DecisionModelCatalogEntry

# TODO update the JSON string below
json = "{}"
# create an instance of DecisionModelCatalogEntry from a JSON string
decision_model_catalog_entry_instance = DecisionModelCatalogEntry.from_json(json)
# print the JSON string representation of the object
print(DecisionModelCatalogEntry.to_json())

# convert the object into a dict
decision_model_catalog_entry_dict = decision_model_catalog_entry_instance.to_dict()
# create an instance of DecisionModelCatalogEntry from a dict
decision_model_catalog_entry_from_dict = DecisionModelCatalogEntry.from_dict(decision_model_catalog_entry_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


