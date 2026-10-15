# ComicsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**browseComics**](ComicsApi.md#browsecomics) | **GET** /v1/comics/browse | Browse and search comics |
| [**getComicBySlug**](ComicsApi.md#getcomicbyslug) | **GET** /v1/comics/{slug} | Get a comic by slug |
| [**listComics**](ComicsApi.md#listcomics) | **GET** /v1/comics | List comics |
| [**listTrendingComics**](ComicsApi.md#listtrendingcomics) | **GET** /v1/comics/trending | List trending comics |



## browseComics

> ListComics200Response browseComics(search, q, genre, status, type, sort, page, limit)

Browse and search comics

Filters the public comic catalog and returns paginated results.

### Example

```ts
import {
  Configuration,
  ComicsApi,
} from '@komikhq/sdk';
import type { BrowseComicsRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new ComicsApi();

  const body = {
    // string (optional)
    search: search_example,
    // string (optional)
    q: q_example,
    // string (optional)
    genre: genre_example,
    // string (optional)
    status: status_example,
    // string (optional)
    type: type_example,
    // string (optional)
    sort: sort_example,
    // string (optional)
    page: page_example,
    // string (optional)
    limit: limit_example,
  } satisfies BrowseComicsRequest;

  try {
    const data = await api.browseComics(body);
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
| **search** | `string` |  | [Optional] [Defaults to `undefined`] |
| **q** | `string` |  | [Optional] [Defaults to `undefined`] |
| **genre** | `string` |  | [Optional] [Defaults to `undefined`] |
| **status** | `string` |  | [Optional] [Defaults to `undefined`] |
| **type** | `string` |  | [Optional] [Defaults to `undefined`] |
| **sort** | `string` |  | [Optional] [Defaults to `undefined`] |
| **page** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**ListComics200Response**](ListComics200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The matching comics and pagination metadata. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getComicBySlug

> object getComicBySlug(slug)

Get a comic by slug

Returns public comic details for the specified slug.

### Example

```ts
import {
  Configuration,
  ComicsApi,
} from '@komikhq/sdk';
import type { GetComicBySlugRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new ComicsApi();

  const body = {
    // string
    slug: slug_example,
  } satisfies GetComicBySlugRequest;

  try {
    const data = await api.getComicBySlug(body);
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
| **200** | Comic details. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listComics

> ListComics200Response listComics(search, q, genre, status, type, sort, page, limit)

List comics

Returns the public comic catalog with optional filters and pagination.

### Example

```ts
import {
  Configuration,
  ComicsApi,
} from '@komikhq/sdk';
import type { ListComicsRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new ComicsApi();

  const body = {
    // string (optional)
    search: search_example,
    // string (optional)
    q: q_example,
    // string (optional)
    genre: genre_example,
    // string (optional)
    status: status_example,
    // string (optional)
    type: type_example,
    // string (optional)
    sort: sort_example,
    // string (optional)
    page: page_example,
    // string (optional)
    limit: limit_example,
  } satisfies ListComicsRequest;

  try {
    const data = await api.listComics(body);
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
| **search** | `string` |  | [Optional] [Defaults to `undefined`] |
| **q** | `string` |  | [Optional] [Defaults to `undefined`] |
| **genre** | `string` |  | [Optional] [Defaults to `undefined`] |
| **status** | `string` |  | [Optional] [Defaults to `undefined`] |
| **type** | `string` |  | [Optional] [Defaults to `undefined`] |
| **sort** | `string` |  | [Optional] [Defaults to `undefined`] |
| **page** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**ListComics200Response**](ListComics200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The matching comics and pagination metadata. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listTrendingComics

> ListTrendingComics200Response listTrendingComics(period, limit)

List trending comics

Returns daily, weekly, or all-time popular comics.

### Example

```ts
import {
  Configuration,
  ComicsApi,
} from '@komikhq/sdk';
import type { ListTrendingComicsRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new ComicsApi();

  const body = {
    // string (optional)
    period: period_example,
    // string (optional)
    limit: limit_example,
  } satisfies ListTrendingComicsRequest;

  try {
    const data = await api.listTrendingComics(body);
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
| **period** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**ListTrendingComics200Response**](ListTrendingComics200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Trending comics and the selected period. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

