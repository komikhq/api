# ReadingHistoryApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**listReadingHistory**](ReadingHistoryApi.md#listreadinghistory) | **GET** /v1/history | List the current user\&#39;s reading history |
| [**recordReadingProgress**](ReadingHistoryApi.md#recordreadingprogressoperation) | **POST** /v1/history | Record reading progress |



## listReadingHistory

> ListReadingHistory200Response listReadingHistory()

List the current user\&#39;s reading history

Returns the authenticated user\&#39;s reading history, including resolved comic media URLs.

### Example

```ts
import {
  Configuration,
  ReadingHistoryApi,
} from '@komikhq/sdk';
import type { ListReadingHistoryRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ReadingHistoryApi(config);

  try {
    const data = await api.listReadingHistory();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**ListReadingHistory200Response**](ListReadingHistory200Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The user\&#39;s reading history. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## recordReadingProgress

> DeleteUserAccount200Response recordReadingProgress(recordReadingProgressRequest)

Record reading progress

Creates or updates reading progress for the authenticated user.

### Example

```ts
import {
  Configuration,
  ReadingHistoryApi,
} from '@komikhq/sdk';
import type { RecordReadingProgressOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ReadingHistoryApi(config);

  const body = {
    // RecordReadingProgressRequest (optional)
    recordReadingProgressRequest: ...,
  } satisfies RecordReadingProgressOperationRequest;

  try {
    const data = await api.recordReadingProgress(body);
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
| **recordReadingProgressRequest** | [RecordReadingProgressRequest](RecordReadingProgressRequest.md) |  | [Optional] |

### Return type

[**DeleteUserAccount200Response**](DeleteUserAccount200Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Reading progress was recorded. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

