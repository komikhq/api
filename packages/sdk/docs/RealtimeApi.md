# RealtimeApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**authorizeRealtimeChannel**](RealtimeApi.md#authorizerealtimechannel) | **POST** /v1/realtime/auth | Authorize a realtime channel |
| [**connectRealtimeWebSocket**](RealtimeApi.md#connectrealtimewebsocket) | **GET** /v1/realtime/ws | Connect to a realtime WebSocket |



## authorizeRealtimeChannel

> any authorizeRealtimeChannel(socketId, channelName)

Authorize a realtime channel

Authorizes a Pusher channel subscription using the current optional user session.

### Example

```ts
import {
  Configuration,
  RealtimeApi,
} from '@komikhq/sdk';
import type { AuthorizeRealtimeChannelRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new RealtimeApi();

  const body = {
    // string
    socketId: socketId_example,
    // string
    channelName: channelName_example,
  } satisfies AuthorizeRealtimeChannelRequest;

  try {
    const data = await api.authorizeRealtimeChannel(body);
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
| **socketId** | `string` |  | [Defaults to `undefined`] |
| **channelName** | `string` |  | [Defaults to `undefined`] |

### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/x-www-form-urlencoded`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Pusher channel authorization response. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## connectRealtimeWebSocket

> connectRealtimeWebSocket(channel, upgrade)

Connect to a realtime WebSocket

Upgrades the request to a WebSocket for global presence or a comment stream.

### Example

```ts
import {
  Configuration,
  RealtimeApi,
} from '@komikhq/sdk';
import type { ConnectRealtimeWebSocketRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new RealtimeApi();

  const body = {
    // string (optional)
    channel: channel_example,
    // string (optional)
    upgrade: upgrade_example,
  } satisfies ConnectRealtimeWebSocketRequest;

  try {
    const data = await api.connectRealtimeWebSocket(body);
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
| **channel** | `string` |  | [Optional] [Defaults to `undefined`] |
| **upgrade** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **101** | The request was upgraded to a WebSocket connection. |  -  |
| **400** | The request contains invalid input. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

