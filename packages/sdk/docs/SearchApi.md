# SearchApi

All URIs are relative to *https://api.komikhq.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getComicSearchSuggestions**](SearchApi.md#getcomicsearchsuggestions) | **GET** /v1/search/suggestions | Get comic search suggestions |



## getComicSearchSuggestions

> GetComicSearchSuggestions200Response getComicSearchSuggestions(q, limit)

Get comic search suggestions

Returns up to six title suggestions. Queries shorter than two characters return an empty list.

### Example

```ts
import {
  Configuration,
  SearchApi,
} from '@komikhq/sdk';
import type { GetComicSearchSuggestionsRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new SearchApi();

  const body = {
    // string | Search text. (optional)
    q: solo leveling,
    // number | Maximum number of suggestions. Values are capped at six. (optional)
    limit: 6,
  } satisfies GetComicSearchSuggestionsRequest;

  try {
    const data = await api.getComicSearchSuggestions(body);
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
| **q** | `string` | Search text. | [Optional] [Defaults to `undefined`] |
| **limit** | `number` | Maximum number of suggestions. Values are capped at six. | [Optional] [Defaults to `undefined`] |

### Return type

[**GetComicSearchSuggestions200Response**](GetComicSearchSuggestions200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Matching comic suggestions. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

