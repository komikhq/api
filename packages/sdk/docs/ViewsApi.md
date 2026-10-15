# ViewsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**recordComicView**](ViewsApi.md#recordcomicviewoperation) | **POST** /v1/view | Record a comic or chapter view |



## recordComicView

> PurgeOrphanedStorageFiles200Response recordComicView(recordComicViewRequest)

Record a comic or chapter view

Records a view. Requests identified as bots are accepted but not counted.

### Example

```ts
import {
  Configuration,
  ViewsApi,
} from '@komikhq/sdk';
import type { RecordComicViewOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new ViewsApi();

  const body = {
    // RecordComicViewRequest (optional)
    recordComicViewRequest: ...,
  } satisfies RecordComicViewOperationRequest;

  try {
    const data = await api.recordComicView(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **recordComicViewRequest** | [RecordComicViewRequest](RecordComicViewRequest.md) |  | [Optional] |

### Return type

[**PurgeOrphanedStorageFiles200Response**](PurgeOrphanedStorageFiles200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The view was recorded or ignored. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

