# ContextPackageLifecycle


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**package_id** | **str** |  | 
**owner_id** | **str** |  | 
**lifecycle_state** | **str** |  | 
**created_at** | **datetime** |  | 
**updated_at** | **datetime** |  | 

## Example

```python
from ratary_sdk.models.context_package_lifecycle import ContextPackageLifecycle

# TODO update the JSON string below
json = "{}"
# create an instance of ContextPackageLifecycle from a JSON string
context_package_lifecycle_instance = ContextPackageLifecycle.from_json(json)
# print the JSON string representation of the object
print(ContextPackageLifecycle.to_json())

# convert the object into a dict
context_package_lifecycle_dict = context_package_lifecycle_instance.to_dict()
# create an instance of ContextPackageLifecycle from a dict
context_package_lifecycle_from_dict = ContextPackageLifecycle.from_dict(context_package_lifecycle_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


