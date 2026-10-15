# ModerationApi

All URIs are relative to *https://api.komikhq.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**adminListModerationReports**](ModerationApi.md#adminlistmoderationreports) | **GET** /v1/admin/reports | List moderation reports |
| [**adminResolveModerationReport**](ModerationApi.md#adminresolvemoderationreportoperation) | **POST** /v1/admin/reports/{id}/action | Resolve a moderation report |



## adminListModerationReports

> object adminListModerationReports(page, limit, status)

List moderation reports

Returns paginated moderation reports, optionally filtered by status.

### Example

```ts
import {
  Configuration,
  ModerationApi,
} from '@komikhq/sdk';
import type { AdminListModerationReportsRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ModerationApi(config);

  const body = {
    // number (optional)
    page: 56,
    // number (optional)
    limit: 56,
    // string (optional)
    status: status_example,
  } satisfies AdminListModerationReportsRequest;

  try {
    const data = await api.adminListModerationReports(body);
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
| **page** | `number` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `undefined`] |
| **status** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**object**

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Matching reports and pagination metadata. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminResolveModerationReport

> object adminResolveModerationReport(id, adminResolveModerationReportRequest)

Resolve a moderation report

Performs a moderation action on a report. Requires administrator access.

### Example

```ts
import {
  Configuration,
  ModerationApi,
} from '@komikhq/sdk';
import type { AdminResolveModerationReportOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ModerationApi(config);

  const body = {
    // string
    id: id_example,
    // AdminResolveModerationReportRequest (optional)
    adminResolveModerationReportRequest: ...,
  } satisfies AdminResolveModerationReportOperationRequest;

  try {
    const data = await api.adminResolveModerationReport(body);
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
| **id** | `string` |  | [Defaults to `undefined`] |
| **adminResolveModerationReportRequest** | [AdminResolveModerationReportRequest](AdminResolveModerationReportRequest.md) |  | [Optional] |

### Return type

**object**

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The report action was completed. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

