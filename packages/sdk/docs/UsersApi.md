# UsersApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**deleteUserAccount**](UsersApi.md#deleteuseraccountoperation) | **DELETE** /v1/user/profile | Delete the current user\&#39;s account |
| [**getUserProfile**](UsersApi.md#getuserprofile) | **GET** /v1/user/profile | Get the current user\&#39;s profile |
| [**uploadUserAvatar**](UsersApi.md#uploaduseravatar) | **POST** /v1/user/avatar | Upload a profile avatar |



## deleteUserAccount

> DeleteUserAccount200Response deleteUserAccount(deleteUserAccountRequest)

Delete the current user\&#39;s account

Permanently deletes the authenticated user\&#39;s account. Password or email confirmation may be supplied.

### Example

```ts
import {
  Configuration,
  UsersApi,
} from '@komikhq/sdk';
import type { DeleteUserAccountOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new UsersApi(config);

  const body = {
    // DeleteUserAccountRequest (optional)
    deleteUserAccountRequest: ...,
  } satisfies DeleteUserAccountOperationRequest;

  try {
    const data = await api.deleteUserAccount(body);
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
| **deleteUserAccountRequest** | [DeleteUserAccountRequest](DeleteUserAccountRequest.md) |  | [Optional] |

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
| **200** | The account was deleted. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getUserProfile

> object getUserProfile()

Get the current user\&#39;s profile

Returns profile details for the authenticated user.

### Example

```ts
import {
  Configuration,
  UsersApi,
} from '@komikhq/sdk';
import type { GetUserProfileRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new UsersApi(config);

  try {
    const data = await api.getUserProfile();
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

**object**

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The user profile. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## uploadUserAvatar

> UploadUserAvatar200Response uploadUserAvatar(file)

Upload a profile avatar

Uploads a new avatar image for the authenticated user.

### Example

```ts
import {
  Configuration,
  UsersApi,
} from '@komikhq/sdk';
import type { UploadUserAvatarRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new UsersApi(config);

  const body = {
    // Blob
    file: BINARY_DATA_HERE,
  } satisfies UploadUserAvatarRequest;

  try {
    const data = await api.uploadUserAvatar(body);
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
| **file** | `Blob` |  | [Defaults to `undefined`] |

### Return type

[**UploadUserAvatar200Response**](UploadUserAvatar200Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The avatar was updated. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

