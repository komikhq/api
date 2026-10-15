# CommentsApi

All URIs are relative to *https://api.komikhq.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createComment**](CommentsApi.md#createcommentoperation) | **POST** /v1/comments | Post a comment |
| [**deleteComment**](CommentsApi.md#deletecomment) | **DELETE** /v1/comments/{commentId} | Delete a comment |
| [**listComments**](CommentsApi.md#listcomments) | **GET** /v1/comments | List comments |
| [**reportComment**](CommentsApi.md#reportcommentoperation) | **POST** /v1/comments/{commentId}/report | Report a comment |
| [**toggleCommentLike**](CommentsApi.md#togglecommentlike) | **POST** /v1/comments/{commentId}/like | Toggle a comment like |



## createComment

> CreateComment201Response createComment(createCommentRequest)

Post a comment

Creates a comment as an authenticated user or as a guest with guestName and guestEmail.

### Example

```ts
import {
  Configuration,
  CommentsApi,
} from '@komikhq/sdk';
import type { CreateCommentOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new CommentsApi();

  const body = {
    // CreateCommentRequest (optional)
    createCommentRequest: ...,
  } satisfies CreateCommentOperationRequest;

  try {
    const data = await api.createComment(body);
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
| **createCommentRequest** | [CreateCommentRequest](CreateCommentRequest.md) |  | [Optional] |

### Return type

[**CreateComment201Response**](CreateComment201Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | The comment was created. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteComment

> CreateComment201Response deleteComment(commentId)

Delete a comment

Deletes a comment owned by the authenticated user or an administrator.

### Example

```ts
import {
  Configuration,
  CommentsApi,
} from '@komikhq/sdk';
import type { DeleteCommentRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new CommentsApi(config);

  const body = {
    // string
    commentId: commentId_example,
  } satisfies DeleteCommentRequest;

  try {
    const data = await api.deleteComment(body);
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
| **commentId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**CreateComment201Response**](CreateComment201Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The comment was deleted. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listComments

> ListComments200Response listComments(comicId, chapterId)

List comments

Returns comments for a comic or chapter.

### Example

```ts
import {
  Configuration,
  CommentsApi,
} from '@komikhq/sdk';
import type { ListCommentsRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new CommentsApi();

  const body = {
    // string (optional)
    comicId: comicId_example,
    // string (optional)
    chapterId: chapterId_example,
  } satisfies ListCommentsRequest;

  try {
    const data = await api.listComments(body);
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
| **comicId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **chapterId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**ListComments200Response**](ListComments200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The matching comments. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## reportComment

> ReportComment201Response reportComment(commentId, reportCommentRequest)

Report a comment

Submits a moderation report. Guest reporter details may be supplied.

### Example

```ts
import {
  Configuration,
  CommentsApi,
} from '@komikhq/sdk';
import type { ReportCommentOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new CommentsApi();

  const body = {
    // string
    commentId: commentId_example,
    // ReportCommentRequest (optional)
    reportCommentRequest: ...,
  } satisfies ReportCommentOperationRequest;

  try {
    const data = await api.reportComment(body);
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
| **commentId** | `string` |  | [Defaults to `undefined`] |
| **reportCommentRequest** | [ReportCommentRequest](ReportCommentRequest.md) |  | [Optional] |

### Return type

[**ReportComment201Response**](ReportComment201Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | The report was submitted. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## toggleCommentLike

> PurgeOrphanedStorageFiles200Response toggleCommentLike(commentId)

Toggle a comment like

Adds or removes the authenticated user\&#39;s like on a comment.

### Example

```ts
import {
  Configuration,
  CommentsApi,
} from '@komikhq/sdk';
import type { ToggleCommentLikeRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new CommentsApi(config);

  const body = {
    // string
    commentId: commentId_example,
  } satisfies ToggleCommentLikeRequest;

  try {
    const data = await api.toggleCommentLike(body);
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
| **commentId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**PurgeOrphanedStorageFiles200Response**](PurgeOrphanedStorageFiles200Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The like state was updated. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

