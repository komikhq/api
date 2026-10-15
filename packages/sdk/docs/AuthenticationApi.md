# AuthenticationApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getAuthSession**](AuthenticationApi.md#getauthsession) | **GET** /v1/auth/get-session | Get the current authentication session |
| [**requestPasswordReset**](AuthenticationApi.md#requestpasswordresetoperation) | **POST** /v1/auth/forget-password | Request a password reset |
| [**resetPassword**](AuthenticationApi.md#resetpasswordoperation) | **POST** /v1/auth/reset-password | Reset a password |
| [**signInWithEmail**](AuthenticationApi.md#signinwithemailoperation) | **POST** /v1/auth/sign-in/email | Sign in with email and password |
| [**signInWithSocialProvider**](AuthenticationApi.md#signinwithsocialprovideroperation) | **POST** /v1/auth/sign-in/social | Start social sign-in |
| [**signOut**](AuthenticationApi.md#signout) | **POST** /v1/auth/sign-out | Sign out |
| [**signUpWithEmail**](AuthenticationApi.md#signupwithemailoperation) | **POST** /v1/auth/sign-up/email | Create an account with email and password |
| [**verifyEmail**](AuthenticationApi.md#verifyemail) | **GET** /v1/auth/verify-email | Verify an email address |



## getAuthSession

> any getAuthSession()

Get the current authentication session

Returns the current Better Auth session, or null when no session exists.

### Example

```ts
import {
  Configuration,
  AuthenticationApi,
} from '@komikhq/sdk';
import type { GetAuthSessionRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new AuthenticationApi();

  try {
    const data = await api.getAuthSession();
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

**any**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The current session. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## requestPasswordReset

> any requestPasswordReset(requestPasswordResetRequest)

Request a password reset

Sends a password reset link to an account email address.

### Example

```ts
import {
  Configuration,
  AuthenticationApi,
} from '@komikhq/sdk';
import type { RequestPasswordResetOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new AuthenticationApi();

  const body = {
    // RequestPasswordResetRequest (optional)
    requestPasswordResetRequest: ...,
  } satisfies RequestPasswordResetOperationRequest;

  try {
    const data = await api.requestPasswordReset(body);
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
| **requestPasswordResetRequest** | [RequestPasswordResetRequest](RequestPasswordResetRequest.md) |  | [Optional] |

### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The password reset request was processed. |  -  |
| **400** | The request contains invalid input. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## resetPassword

> any resetPassword(resetPasswordRequest)

Reset a password

Sets a new password using a valid reset token.

### Example

```ts
import {
  Configuration,
  AuthenticationApi,
} from '@komikhq/sdk';
import type { ResetPasswordOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new AuthenticationApi();

  const body = {
    // ResetPasswordRequest (optional)
    resetPasswordRequest: ...,
  } satisfies ResetPasswordOperationRequest;

  try {
    const data = await api.resetPassword(body);
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
| **resetPasswordRequest** | [ResetPasswordRequest](ResetPasswordRequest.md) |  | [Optional] |

### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The password was reset. |  -  |
| **400** | The request contains invalid input. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## signInWithEmail

> any signInWithEmail(signInWithEmailRequest)

Sign in with email and password

Authenticates a user and sets the session cookie.

### Example

```ts
import {
  Configuration,
  AuthenticationApi,
} from '@komikhq/sdk';
import type { SignInWithEmailOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new AuthenticationApi();

  const body = {
    // SignInWithEmailRequest (optional)
    signInWithEmailRequest: ...,
  } satisfies SignInWithEmailOperationRequest;

  try {
    const data = await api.signInWithEmail(body);
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
| **signInWithEmailRequest** | [SignInWithEmailRequest](SignInWithEmailRequest.md) |  | [Optional] |

### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The user was authenticated. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## signInWithSocialProvider

> any signInWithSocialProvider(signInWithSocialProviderRequest)

Start social sign-in

Starts an OAuth sign-in flow. Google is configured as a provider.

### Example

```ts
import {
  Configuration,
  AuthenticationApi,
} from '@komikhq/sdk';
import type { SignInWithSocialProviderOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new AuthenticationApi();

  const body = {
    // SignInWithSocialProviderRequest (optional)
    signInWithSocialProviderRequest: ...,
  } satisfies SignInWithSocialProviderOperationRequest;

  try {
    const data = await api.signInWithSocialProvider(body);
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
| **signInWithSocialProviderRequest** | [SignInWithSocialProviderRequest](SignInWithSocialProviderRequest.md) |  | [Optional] |

### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OAuth redirect details. |  -  |
| **400** | The request contains invalid input. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## signOut

> any signOut()

Sign out

Ends the current session and clears its cached session entry.

### Example

```ts
import {
  Configuration,
  AuthenticationApi,
} from '@komikhq/sdk';
import type { SignOutRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new AuthenticationApi();

  try {
    const data = await api.signOut();
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

**any**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The session was ended. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## signUpWithEmail

> any signUpWithEmail(signUpWithEmailRequest)

Create an account with email and password

Creates a user account and sends email verification when configured.

### Example

```ts
import {
  Configuration,
  AuthenticationApi,
} from '@komikhq/sdk';
import type { SignUpWithEmailOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new AuthenticationApi();

  const body = {
    // SignUpWithEmailRequest (optional)
    signUpWithEmailRequest: ...,
  } satisfies SignUpWithEmailOperationRequest;

  try {
    const data = await api.signUpWithEmail(body);
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
| **signUpWithEmailRequest** | [SignUpWithEmailRequest](SignUpWithEmailRequest.md) |  | [Optional] |

### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The account was created. |  -  |
| **400** | The request contains invalid input. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## verifyEmail

> any verifyEmail(token, callbackURL)

Verify an email address

Verifies an email address using a Better Auth verification token.

### Example

```ts
import {
  Configuration,
  AuthenticationApi,
} from '@komikhq/sdk';
import type { VerifyEmailRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const api = new AuthenticationApi();

  const body = {
    // string
    token: token_example,
    // string (optional)
    callbackURL: callbackURL_example,
  } satisfies VerifyEmailRequest;

  try {
    const data = await api.verifyEmail(body);
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
| **token** | `string` |  | [Defaults to `undefined`] |
| **callbackURL** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The email was verified. |  -  |
| **400** | The request contains invalid input. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

