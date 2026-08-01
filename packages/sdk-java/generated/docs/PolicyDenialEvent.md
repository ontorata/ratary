

# PolicyDenialEvent


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**denialId** | **String** |  |  |
|**ownerId** | **String** |  |  |
|**point** | [**PointEnum**](#PointEnum) |  |  |
|**policyModuleId** | **String** |  |  [optional] |
|**reasonCode** | **String** |  |  |
|**occurredAt** | **OffsetDateTime** |  |  |
|**memoryId** | **String** |  |  [optional] |
|**resource** | **String** |  |  [optional] |



## Enum: PointEnum

| Name | Value |
|---- | -----|
| WRITE | &quot;write&quot; |
| RECALL | &quot;recall&quot; |
| STEWARDSHIP | &quot;stewardship&quot; |



