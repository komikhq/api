# SitemapsApi

All URIs are relative to *https://api.komikhq.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getChaptersXmlSitemap**](SitemapsApi.md#getchaptersxmlsitemap) | **GET** /sitemap-chapters.xml | Get the chapters XML sitemap |
| [**getComicsXmlSitemap**](SitemapsApi.md#getcomicsxmlsitemap) | **GET** /sitemap-comics.xml | Get the comics XML sitemap |
| [**getSitemapSummary**](SitemapsApi.md#getsitemapsummary) | **GET** /v1/sitemaps/summary | Get sitemap update summary |
| [**listSitemapChapters**](SitemapsApi.md#listsitemapchapters) | **GET** /v1/sitemaps/chapters | List chapters for sitemap generation |
| [**listSitemapComics**](SitemapsApi.md#listsitemapcomics) | **GET** /v1/sitemaps/comics | List comics for sitemap generation |



## getChaptersXmlSitemap

> string getChaptersXmlSitemap()

Get the chapters XML sitemap

Returns the XML sitemap for indexed chapter pages.

### Example

```ts
import {
  Configuration,
  SitemapsApi,
} from '@komikhq/sdk';
import type { GetChaptersXmlSitemapRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new SitemapsApi();

  try {
    const data = await api.getChaptersXmlSitemap();
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

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/xml`, `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The generated XML sitemap. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getComicsXmlSitemap

> string getComicsXmlSitemap()

Get the comics XML sitemap

Returns the XML sitemap for indexed comic pages.

### Example

```ts
import {
  Configuration,
  SitemapsApi,
} from '@komikhq/sdk';
import type { GetComicsXmlSitemapRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new SitemapsApi();

  try {
    const data = await api.getComicsXmlSitemap();
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

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/xml`, `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The generated XML sitemap. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSitemapSummary

> GetSitemapSummary200Response getSitemapSummary()

Get sitemap update summary

Returns the latest comic and chapter update timestamps.

### Example

```ts
import {
  Configuration,
  SitemapsApi,
} from '@komikhq/sdk';
import type { GetSitemapSummaryRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new SitemapsApi();

  try {
    const data = await api.getSitemapSummary();
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

[**GetSitemapSummary200Response**](GetSitemapSummary200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Latest catalog update timestamps. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listSitemapChapters

> ListSitemapChapters200Response listSitemapChapters(limit, page)

List chapters for sitemap generation

Returns paginated comic chapter slugs and update times.

### Example

```ts
import {
  Configuration,
  SitemapsApi,
} from '@komikhq/sdk';
import type { ListSitemapChaptersRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new SitemapsApi();

  const body = {
    // string (optional)
    limit: limit_example,
    // string (optional)
    page: page_example,
  } satisfies ListSitemapChaptersRequest;

  try {
    const data = await api.listSitemapChapters(body);
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
| **limit** | `string` |  | [Optional] [Defaults to `undefined`] |
| **page** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**ListSitemapChapters200Response**](ListSitemapChapters200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Chapter sitemap entries. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listSitemapComics

> ListSitemapComics200Response listSitemapComics(limit, page)

List comics for sitemap generation

Returns comic slugs and update times for XML sitemap generation.

### Example

```ts
import {
  Configuration,
  SitemapsApi,
} from '@komikhq/sdk';
import type { ListSitemapComicsRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new SitemapsApi();

  const body = {
    // string (optional)
    limit: limit_example,
    // string (optional)
    page: page_example,
  } satisfies ListSitemapComicsRequest;

  try {
    const data = await api.listSitemapComics(body);
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
| **limit** | `string` |  | [Optional] [Defaults to `undefined`] |
| **page** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**ListSitemapComics200Response**](ListSitemapComics200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Comic sitemap entries. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

