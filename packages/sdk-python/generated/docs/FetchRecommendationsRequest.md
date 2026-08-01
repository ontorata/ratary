# FetchRecommendationsRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**query** | **str** |  | 
**limit** | **int** |  | [optional] 

## Example

```python
from ratary_sdk.models.fetch_recommendations_request import FetchRecommendationsRequest

# TODO update the JSON string below
json = "{}"
# create an instance of FetchRecommendationsRequest from a JSON string
fetch_recommendations_request_instance = FetchRecommendationsRequest.from_json(json)
# print the JSON string representation of the object
print(FetchRecommendationsRequest.to_json())

# convert the object into a dict
fetch_recommendations_request_dict = fetch_recommendations_request_instance.to_dict()
# create an instance of FetchRecommendationsRequest from a dict
fetch_recommendations_request_from_dict = FetchRecommendationsRequest.from_dict(fetch_recommendations_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


