# BookmarksApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**listBookmarks**](BookmarksApi.md#listbookmarks) | **GET** /v1/bookmarks | List the current user\&#39;s bookmarks |
| [**removeBookmark**](BookmarksApi.md#removebookmark) | **DELETE** /v1/bookmarks/{comicId} | Remove a bookmark |
| [**saveBookmark**](BookmarksApi.md#savebookmarkoperation) | **POST** /v1/bookmarks | Create or update a bookmark |



## listBookmarks

> ListBookmarks200Response listBookmarks()

List the current user\&#39;s bookmarks

Returns bookmarked comics for the authenticated user.

### Example

```ts
import {
  Configuration,
  BookmarksApi,
} from '@komikhq/sdk';
import type { ListBookmarksRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new BookmarksApi(config);

  try {
    const data = await api.listBookmarks();
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

[**ListBookmarks200Response**](ListBookmarks200Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The user\&#39;s bookmarks. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeBookmark

> DeleteUserAccount200Response removeBookmark(comicId)

Remove a bookmark

Removes a comic from the authenticated user\&#39;s bookmarks.

### Example

```ts
import {
  Configuration,
  BookmarksApi,
} from '@komikhq/sdk';
import type { RemoveBookmarkRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new BookmarksApi(config);

  const body = {
    // string
    comicId: comicId_example,
  } satisfies RemoveBookmarkRequest;

  try {
    const data = await api.removeBookmark(body);
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
| **comicId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**DeleteUserAccount200Response**](DeleteUserAccount200Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The bookmark was removed. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## saveBookmark

> DeleteUserAccount200Response saveBookmark(saveBookmarkRequest)

Create or update a bookmark

Creates or updates a comic bookmark for the authenticated user.

### Example

```ts
import {
  Configuration,
  BookmarksApi,
} from '@komikhq/sdk';
import type { SaveBookmarkOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new BookmarksApi(config);

  const body = {
    // SaveBookmarkRequest (optional)
    saveBookmarkRequest: ...,
  } satisfies SaveBookmarkOperationRequest;

  try {
    const data = await api.saveBookmark(body);
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
| **saveBookmarkRequest** | [SaveBookmarkRequest](SaveBookmarkRequest.md) |  | [Optional] |

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
| **200** | The bookmark was saved. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

