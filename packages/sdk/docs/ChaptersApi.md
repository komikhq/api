# ChaptersApi

All URIs are relative to *https://api.komikhq.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getPublicChapter**](ChaptersApi.md#getpublicchapter) | **GET** /v1/comics/{slug}/chapters/{chapterSlug} | Get a public comic chapter |



## getPublicChapter

> object getPublicChapter(slug, chapterSlug)

Get a public comic chapter

Returns chapter reader data for the specified comic and chapter slugs.

### Example

```ts
import {
  Configuration,
  ChaptersApi,
} from '@komikhq/sdk';
import type { GetPublicChapterRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new ChaptersApi();

  const body = {
    // string
    slug: slug_example,
    // string
    chapterSlug: chapterSlug_example,
  } satisfies GetPublicChapterRequest;

  try {
    const data = await api.getPublicChapter(body);
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
| **slug** | `string` |  | [Defaults to `undefined`] |
| **chapterSlug** | `string` |  | [Defaults to `undefined`] |

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The chapter and reader data. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

