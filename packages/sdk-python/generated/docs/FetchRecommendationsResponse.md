# FetchRecommendationsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**trace_id** | **str** |  | 
**cards** | [**List[RecommendationCard]**](RecommendationCard.md) |  | 
**advisory** | **bool** |  | 
**rerank** | [**RecommendationRerankMetadata**](RecommendationRerankMetadata.md) |  | [optional] 

## Example

```python
from ratary_sdk.models.fetch_recommendations_response import FetchRecommendationsResponse

# TODO update the JSON string below
json = "{}"
# create an instance of FetchRecommendationsResponse from a JSON string
fetch_recommendations_response_instance = FetchRecommendationsResponse.from_json(json)
# print the JSON string representation of the object
print(FetchRecommendationsResponse.to_json())

# convert the object into a dict
fetch_recommendations_response_dict = fetch_recommendations_response_instance.to_dict()
# create an instance of FetchRecommendationsResponse from a dict
fetch_recommendations_response_from_dict = FetchRecommendationsResponse.from_dict(fetch_recommendations_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


