# RatingsApi

All URIs are relative to *https://api.komikhq.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**submitComicRating**](RatingsApi.md#submitcomicratingoperation) | **POST** /v1/ratings | Submit a comic rating |



## submitComicRating

> SubmitComicRating200Response submitComicRating(submitComicRatingRequest)

Submit a comic rating

Creates or updates the authenticated user\&#39;s rating for a comic.

### Example

```ts
import {
  Configuration,
  RatingsApi,
} from '@komikhq/sdk';
import type { SubmitComicRatingOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RatingsApi(config);

  const body = {
    // SubmitComicRatingRequest (optional)
    submitComicRatingRequest: ...,
  } satisfies SubmitComicRatingOperationRequest;

  try {
    const data = await api.submitComicRating(body);
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
| **submitComicRatingRequest** | [SubmitComicRatingRequest](SubmitComicRatingRequest.md) |  | [Optional] |

### Return type

[**SubmitComicRating200Response**](SubmitComicRating200Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The rating was recorded. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

