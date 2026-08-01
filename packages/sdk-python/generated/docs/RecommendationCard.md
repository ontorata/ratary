# RecommendationCard


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**card_id** | **str** |  | 
**title** | **str** |  | 
**advisory** | **bool** |  | 
**memory_id** | **str** |  | [optional] 
**source_reference** | **str** |  | 
**confidence** | **float** |  | [optional] 
**computed_score** | **float** | PI-P6-D1.1 sandbox score when re-rank applied | [optional] 
**evidence_refs** | **List[str]** |  | 
**reason** | **str** |  | 

## Example

```python
from ratary_sdk.models.recommendation_card import RecommendationCard

# TODO update the JSON string below
json = "{}"
# create an instance of RecommendationCard from a JSON string
recommendation_card_instance = RecommendationCard.from_json(json)
# print the JSON string representation of the object
print(RecommendationCard.to_json())

# convert the object into a dict
recommendation_card_dict = recommendation_card_instance.to_dict()
# create an instance of RecommendationCard from a dict
recommendation_card_from_dict = RecommendationCard.from_dict(recommendation_card_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


