

# Memory


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**id** | **UUID** |  |  [optional] |
|**title** | **String** |  |  [optional] |
|**content** | **String** |  |  [optional] |
|**summary** | **String** |  |  [optional] |
|**project** | **String** |  |  [optional] |
|**tags** | **List&lt;String&gt;** |  |  [optional] |
|**favorite** | **Boolean** |  |  [optional] |
|**archived** | **Boolean** |  |  [optional] |
|**lifecycleState** | [**LifecycleStateEnum**](#LifecycleStateEnum) | Optional stewardship lifecycle hint when set |  [optional] |
|**createdAt** | **OffsetDateTime** |  |  [optional] |
|**updatedAt** | **OffsetDateTime** |  |  [optional] |



## Enum: LifecycleStateEnum

| Name | Value |
|---- | -----|
| ACTIVE | &quot;active&quot; |
| STALE | &quot;stale&quot; |
| CANDIDATE_COMPRESS | &quot;candidate_compress&quot; |



