# HealthApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getHealth**](HealthApi.md#gethealth) | **GET** /health | Check API health |



## getHealth

> GetHealth200Response getHealth()

Check API health

Checks the database, cache binding, and media storage binding.

### Example

```ts
import {
  Configuration,
  HealthApi,
} from '@komikhq/sdk';
import type { GetHealthRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new HealthApi();

  try {
    const data = await api.getHealth();
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

[**GetHealth200Response**](GetHealth200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | All checked services are available. |  -  |
| **503** | One or more checked services are unavailable. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

