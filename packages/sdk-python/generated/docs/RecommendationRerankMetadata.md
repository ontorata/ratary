# RecommendationRerankMetadata


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**applied** | **bool** |  | 
**decision_model_id** | **str** |  | [optional] 
**decision_model_version** | **str** |  | [optional] 
**sandbox_outcome** | **str** |  | [optional] 
**plugin_digest_prefix** | **str** |  | [optional] 
**reason** | **str** |  | [optional] 

## Example

```python
from ratary_sdk.models.recommendation_rerank_metadata import RecommendationRerankMetadata

# TODO update the JSON string below
json = "{}"
# create an instance of RecommendationRerankMetadata from a JSON string
recommendation_rerank_metadata_instance = RecommendationRerankMetadata.from_json(json)
# print the JSON string representation of the object
print(RecommendationRerankMetadata.to_json())

# convert the object into a dict
recommendation_rerank_metadata_dict = recommendation_rerank_metadata_instance.to_dict()
# create an instance of RecommendationRerankMetadata from a dict
recommendation_rerank_metadata_from_dict = RecommendationRerankMetadata.from_dict(recommendation_rerank_metadata_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


