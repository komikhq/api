# GenresApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**listGenres**](GenresApi.md#listgenres) | **GET** /v1/genres | List comic genres |



## listGenres

> ListGenres200Response listGenres()

List comic genres

Returns the public comic genre catalog.

### Example

```ts
import {
  Configuration,
  GenresApi,
} from '@komikhq/sdk';
import type { ListGenresRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new GenresApi();

  try {
    const data = await api.listGenres();
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

[**ListGenres200Response**](ListGenres200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The available genres. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

