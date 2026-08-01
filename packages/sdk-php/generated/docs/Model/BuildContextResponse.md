# BuildContextResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**context** | **string** |  | [optional]
**prompt** | **string** |  | [optional]
**system** | **string** |  | [optional]
**user** | **string** |  | [optional]
**memory_count** | **int** |  | [optional]
**package_id** | **string** | ADR-1011 Ratary-issued Context Package id | [optional]
**owner_id** | **string** |  | [optional]
**created_at** | **\DateTime** |  | [optional]
**confidence** | **string** |  | [optional]
**confidence_model** | **string** | ADR-1016 confidence derivation model id | [optional]
**update_mechanism** | **string** |  | [optional]
**lifecycle_state** | **string** | ADR-1013 usage eligibility; mint is always active | [optional]
**source_labels** | **string[]** |  | [optional]
**query** | **string** |  | [optional]
**retrieval_memo** | **string** | ADR-1018 ranked-candidate memo status; package envelope always reminted | [optional]

[[Back to Model list]](../../README.md#models) [[Back to API list]](../../README.md#endpoints) [[Back to README]](../../README.md)
