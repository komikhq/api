# AdministrationApi

All URIs are relative to *https://api.komikhq.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**adminCreateChapter**](AdministrationApi.md#admincreatechapter) | **POST** /v1/admin/comics/{comicId}/chapters | Create a chapter with pages |
| [**adminCreateComic**](AdministrationApi.md#admincreatecomic) | **POST** /v1/admin/comics | Create a comic |
| [**adminCreateGenre**](AdministrationApi.md#admincreategenreoperation) | **POST** /v1/admin/genres | Create a genre |
| [**adminCreateUser**](AdministrationApi.md#admincreateuseroperation) | **POST** /v1/admin/users | Create a user |
| [**adminDeleteChapter**](AdministrationApi.md#admindeletechapter) | **DELETE** /v1/admin/comics/{comicId}/chapters/{id} | Delete a chapter |
| [**adminDeleteComic**](AdministrationApi.md#admindeletecomic) | **DELETE** /v1/admin/comics/{id} | Delete a comic |
| [**adminDeleteGenre**](AdministrationApi.md#admindeletegenre) | **DELETE** /v1/admin/genres/{id} | Delete a genre |
| [**adminDeleteUser**](AdministrationApi.md#admindeleteuser) | **DELETE** /v1/admin/users/{id} | Delete a user |
| [**adminFinalizeChapter**](AdministrationApi.md#adminfinalizechapteroperation) | **POST** /v1/admin/comics/{comicId}/chapters/{id}/finalize | Finalize a chapter |
| [**adminGetChapter**](AdministrationApi.md#admingetchapter) | **GET** /v1/admin/comics/{comicId}/chapters/{id} | Get chapter details |
| [**adminGetComic**](AdministrationApi.md#admingetcomic) | **GET** /v1/admin/comics/{id} | Get comic details |
| [**adminGetPlatformStats**](AdministrationApi.md#admingetplatformstats) | **GET** /v1/admin/stats | Get platform statistics |
| [**adminInitializeChapter**](AdministrationApi.md#admininitializechapteroperation) | **POST** /v1/admin/comics/{comicId}/chapters/init | Initialize a chapter upload |
| [**adminListChapters**](AdministrationApi.md#adminlistchapters) | **GET** /v1/admin/comics/{comicId}/chapters | List comic chapters |
| [**adminListComics**](AdministrationApi.md#adminlistcomics) | **GET** /v1/admin/comics | List comics |
| [**adminListGenres**](AdministrationApi.md#adminlistgenres) | **GET** /v1/admin/genres | List all genres |
| [**adminListUsers**](AdministrationApi.md#adminlistusers) | **GET** /v1/admin/users | List users |
| [**adminUpdateChapter**](AdministrationApi.md#adminupdatechapter) | **PUT** /v1/admin/comics/{comicId}/chapters/{id} | Update chapter metadata |
| [**adminUpdateComic**](AdministrationApi.md#adminupdatecomic) | **PUT** /v1/admin/comics/{id} | Update a comic |
| [**adminUpdateGenre**](AdministrationApi.md#adminupdategenreoperation) | **PUT** /v1/admin/genres/{id} | Update a genre |
| [**adminUpdateUser**](AdministrationApi.md#adminupdateuser) | **PUT** /v1/admin/users/{id} | Update a user |
| [**adminUploadChapterPage**](AdministrationApi.md#adminuploadchapterpage) | **POST** /v1/admin/comics/{comicId}/chapters/{id}/pages/upload | Upload a chapter page |
| [**clearSearchSuggestionCache**](AdministrationApi.md#clearsearchsuggestioncache) | **POST** /v1/admin/system/clear-search-cache | Clear the search suggestion cache |
| [**getSystemMaintenanceStatus**](AdministrationApi.md#getsystemmaintenancestatus) | **GET** /v1/admin/system/maintenance-status | Get system maintenance status |
| [**purgeOrphanedStorageFiles**](AdministrationApi.md#purgeorphanedstoragefiles) | **POST** /v1/admin/storage/purge-orphans | Purge orphaned storage files |
| [**synchronizeViewCounts**](AdministrationApi.md#synchronizeviewcounts) | **POST** /v1/admin/system/sync-views | Synchronize view counts |



## adminCreateChapter

> object adminCreateChapter(comicId, chapterNumber, pages, title, accessTier, isEarlyAccess)

Create a chapter with pages

Creates a chapter and uploads its pages in one request.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminCreateChapterRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    comicId: 'comicId_example',
    // string
    chapterNumber: 'chapterNumber_example',
    // Array<Blob>
    pages: [new Blob(['example file content'], { type: 'application/octet-stream' })],
    // string (optional)
    title: 'title_example',
    // string (optional)
    accessTier: 'accessTier_example',
    // boolean (optional)
    isEarlyAccess: true,
  } satisfies AdminCreateChapterRequest;

  try {
    const data = await api.adminCreateChapter(body);
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
| **comicId** | `string` |  | [Defaults to `undefined`] |
| **chapterNumber** | `string` |  | [Defaults to `undefined`] |
| **pages** | `Array<Blob>` |  | |
| **title** | `string` |  | [Optional] [Defaults to `undefined`] |
| **accessTier** | `string` |  | [Optional] [Defaults to `undefined`] |
| **isEarlyAccess** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**object**

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | The chapter and pages were created. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminCreateComic

> AdminCreateComic201Response adminCreateComic(title, synopsis, type, status, accessTier, alternateTitles, genreIds, creator, cover, coverUrlSource, banner, bannerUrlSource)

Create a comic

Creates a comic and optionally uploads cover and banner images. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminCreateComicRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string (optional)
    title: title_example,
    // string (optional)
    synopsis: synopsis_example,
    // string (optional)
    type: type_example,
    // string (optional)
    status: status_example,
    // string (optional)
    accessTier: accessTier_example,
    // AdminCreateComicRequestAlternateTitles (optional)
    alternateTitles: ...,
    // string (optional)
    genreIds: genreIds_example,
    // string (optional)
    creator: creator_example,
    // Blob (optional)
    cover: BINARY_DATA_HERE,
    // string (optional)
    coverUrlSource: coverUrlSource_example,
    // Blob (optional)
    banner: BINARY_DATA_HERE,
    // string (optional)
    bannerUrlSource: bannerUrlSource_example,
  } satisfies AdminCreateComicRequest;

  try {
    const data = await api.adminCreateComic(body);
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
| **title** | `string` |  | [Optional] [Defaults to `undefined`] |
| **synopsis** | `string` |  | [Optional] [Defaults to `undefined`] |
| **type** | `string` |  | [Optional] [Defaults to `undefined`] |
| **status** | `string` |  | [Optional] [Defaults to `undefined`] |
| **accessTier** | `string` |  | [Optional] [Defaults to `undefined`] |
| **alternateTitles** | [AdminCreateComicRequestAlternateTitles](AdminCreateComicRequestAlternateTitles.md) |  | [Optional] [Defaults to `undefined`] |
| **genreIds** | `string` |  | [Optional] [Defaults to `undefined`] |
| **creator** | `string` |  | [Optional] [Defaults to `undefined`] |
| **cover** | `Blob` |  | [Optional] [Defaults to `undefined`] |
| **coverUrlSource** | `string` |  | [Optional] [Defaults to `undefined`] |
| **banner** | `Blob` |  | [Optional] [Defaults to `undefined`] |
| **bannerUrlSource** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**AdminCreateComic201Response**](AdminCreateComic201Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | The comic was created. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminCreateGenre

> AdminCreateGenre201Response adminCreateGenre(adminCreateGenreRequest)

Create a genre

Creates a genre. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminCreateGenreOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // AdminCreateGenreRequest (optional)
    adminCreateGenreRequest: ...,
  } satisfies AdminCreateGenreOperationRequest;

  try {
    const data = await api.adminCreateGenre(body);
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
| **adminCreateGenreRequest** | [AdminCreateGenreRequest](AdminCreateGenreRequest.md) |  | [Optional] |

### Return type

[**AdminCreateGenre201Response**](AdminCreateGenre201Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | The genre was created. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminCreateUser

> object adminCreateUser(adminCreateUserRequest)

Create a user

Creates a user account. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminCreateUserOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // AdminCreateUserRequest (optional)
    adminCreateUserRequest: ...,
  } satisfies AdminCreateUserOperationRequest;

  try {
    const data = await api.adminCreateUser(body);
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
| **adminCreateUserRequest** | [AdminCreateUserRequest](AdminCreateUserRequest.md) |  | [Optional] |

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
| **201** | The user was created. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminDeleteChapter

> object adminDeleteChapter(comicId, id)

Delete a chapter

Deletes a chapter and its associated pages.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminDeleteChapterRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    comicId: comicId_example,
    // string
    id: id_example,
  } satisfies AdminDeleteChapterRequest;

  try {
    const data = await api.adminDeleteChapter(body);
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
| **comicId** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |

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
| **200** | The chapter was deleted. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminDeleteComic

> DeleteUserAccount200Response adminDeleteComic(id)

Delete a comic

Deletes a comic. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminDeleteComicRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    id: id_example,
  } satisfies AdminDeleteComicRequest;

  try {
    const data = await api.adminDeleteComic(body);
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

### Return type

[**DeleteUserAccount200Response**](DeleteUserAccount200Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The comic was deleted. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminDeleteGenre

> DeleteUserAccount200Response adminDeleteGenre(id)

Delete a genre

Deletes a genre by ID. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminDeleteGenreRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    id: id_example,
  } satisfies AdminDeleteGenreRequest;

  try {
    const data = await api.adminDeleteGenre(body);
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

### Return type

[**DeleteUserAccount200Response**](DeleteUserAccount200Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The genre was deleted. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminDeleteUser

> object adminDeleteUser(id)

Delete a user

Permanently deletes a user account by ID. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminDeleteUserRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    id: id_example,
  } satisfies AdminDeleteUserRequest;

  try {
    const data = await api.adminDeleteUser(body);
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
| **200** | The user was deleted. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminFinalizeChapter

> object adminFinalizeChapter(comicId, id, adminFinalizeChapterRequest)

Finalize a chapter

Sets the final page count for a chapter.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminFinalizeChapterOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    comicId: comicId_example,
    // string
    id: id_example,
    // AdminFinalizeChapterRequest (optional)
    adminFinalizeChapterRequest: ...,
  } satisfies AdminFinalizeChapterOperationRequest;

  try {
    const data = await api.adminFinalizeChapter(body);
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
| **comicId** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |
| **adminFinalizeChapterRequest** | [AdminFinalizeChapterRequest](AdminFinalizeChapterRequest.md) |  | [Optional] |

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
| **200** | The chapter was finalized. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminGetChapter

> object adminGetChapter(comicId, id)

Get chapter details

Gets chapter metadata and pages by ID.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminGetChapterRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    comicId: comicId_example,
    // string
    id: id_example,
  } satisfies AdminGetChapterRequest;

  try {
    const data = await api.adminGetChapter(body);
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
| **comicId** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |

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
| **200** | The chapter and its pages. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminGetComic

> object adminGetComic(id)

Get comic details

Gets comic details by ID. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminGetComicRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    id: id_example,
  } satisfies AdminGetComicRequest;

  try {
    const data = await api.adminGetComic(body);
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
| **200** | The comic and its details. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminGetPlatformStats

> object adminGetPlatformStats()

Get platform statistics

Returns administrative platform statistics.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminGetPlatformStatsRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  try {
    const data = await api.adminGetPlatformStats();
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
| **200** | Platform statistics. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminInitializeChapter

> object adminInitializeChapter(comicId, adminInitializeChapterRequest)

Initialize a chapter upload

Creates chapter metadata before pages are uploaded.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminInitializeChapterOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    comicId: comicId_example,
    // AdminInitializeChapterRequest (optional)
    adminInitializeChapterRequest: ...,
  } satisfies AdminInitializeChapterOperationRequest;

  try {
    const data = await api.adminInitializeChapter(body);
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
| **comicId** | `string` |  | [Defaults to `undefined`] |
| **adminInitializeChapterRequest** | [AdminInitializeChapterRequest](AdminInitializeChapterRequest.md) |  | [Optional] |

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
| **201** | The chapter upload was initialized. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminListChapters

> object adminListChapters(comicId)

List comic chapters

Lists chapters for a comic. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminListChaptersRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    comicId: comicId_example,
  } satisfies AdminListChaptersRequest;

  try {
    const data = await api.adminListChapters(body);
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
| **comicId** | `string` |  | [Defaults to `undefined`] |

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
| **200** | The comic\&#39;s chapters. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminListComics

> object adminListComics(q, status, page, limit)

List comics

Lists comics with search, status filtering, and pagination. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminListComicsRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string (optional)
    q: q_example,
    // string (optional)
    status: status_example,
    // string (optional)
    page: page_example,
    // string (optional)
    limit: limit_example,
  } satisfies AdminListComicsRequest;

  try {
    const data = await api.adminListComics(body);
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
| **q** | `string` |  | [Optional] [Defaults to `undefined`] |
| **status** | `string` |  | [Optional] [Defaults to `undefined`] |
| **page** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `string` |  | [Optional] [Defaults to `undefined`] |

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
| **200** | The matching comics and pagination data. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminListGenres

> AdminListGenres200Response adminListGenres()

List all genres

Returns all genres. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminListGenresRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  try {
    const data = await api.adminListGenres();
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

[**AdminListGenres200Response**](AdminListGenres200Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The genre catalog. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminListUsers

> object adminListUsers(q, page, limit)

List users

Searches and returns a paginated user list. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminListUsersRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string (optional)
    q: q_example,
    // number (optional)
    page: 56,
    // number (optional)
    limit: 56,
  } satisfies AdminListUsersRequest;

  try {
    const data = await api.adminListUsers(body);
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
| **q** | `string` |  | [Optional] [Defaults to `undefined`] |
| **page** | `number` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `undefined`] |

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
| **200** | Matching users and pagination metadata. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminUpdateChapter

> object adminUpdateChapter(comicId, id, requestBody)

Update chapter metadata

Updates chapter metadata by ID.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminUpdateChapterRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    comicId: comicId_example,
    // string
    id: id_example,
    // { [key: string]: any | null; } (optional)
    requestBody: Object,
  } satisfies AdminUpdateChapterRequest;

  try {
    const data = await api.adminUpdateChapter(body);
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
| **comicId** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any | null; }` |  | [Optional] |

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
| **200** | The chapter was updated. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminUpdateComic

> AdminCreateComic201Response adminUpdateComic(id, title, synopsis, type, status, accessTier, alternateTitles, genreIds, creator, cover, coverUrlSource, banner, bannerUrlSource)

Update a comic

Updates comic details and optional cover/banner images. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminUpdateComicRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    id: id_example,
    // string (optional)
    title: title_example,
    // string (optional)
    synopsis: synopsis_example,
    // string (optional)
    type: type_example,
    // string (optional)
    status: status_example,
    // string (optional)
    accessTier: accessTier_example,
    // AdminCreateComicRequestAlternateTitles (optional)
    alternateTitles: ...,
    // string (optional)
    genreIds: genreIds_example,
    // string (optional)
    creator: creator_example,
    // Blob (optional)
    cover: BINARY_DATA_HERE,
    // string (optional)
    coverUrlSource: coverUrlSource_example,
    // Blob (optional)
    banner: BINARY_DATA_HERE,
    // string (optional)
    bannerUrlSource: bannerUrlSource_example,
  } satisfies AdminUpdateComicRequest;

  try {
    const data = await api.adminUpdateComic(body);
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
| **title** | `string` |  | [Optional] [Defaults to `undefined`] |
| **synopsis** | `string` |  | [Optional] [Defaults to `undefined`] |
| **type** | `string` |  | [Optional] [Defaults to `undefined`] |
| **status** | `string` |  | [Optional] [Defaults to `undefined`] |
| **accessTier** | `string` |  | [Optional] [Defaults to `undefined`] |
| **alternateTitles** | [AdminCreateComicRequestAlternateTitles](AdminCreateComicRequestAlternateTitles.md) |  | [Optional] [Defaults to `undefined`] |
| **genreIds** | `string` |  | [Optional] [Defaults to `undefined`] |
| **creator** | `string` |  | [Optional] [Defaults to `undefined`] |
| **cover** | `Blob` |  | [Optional] [Defaults to `undefined`] |
| **coverUrlSource** | `string` |  | [Optional] [Defaults to `undefined`] |
| **banner** | `Blob` |  | [Optional] [Defaults to `undefined`] |
| **bannerUrlSource** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**AdminCreateComic201Response**](AdminCreateComic201Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The comic was updated. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminUpdateGenre

> AdminCreateGenre201Response adminUpdateGenre(id, adminUpdateGenreRequest)

Update a genre

Updates a genre by ID. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminUpdateGenreOperationRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    id: id_example,
    // AdminUpdateGenreRequest (optional)
    adminUpdateGenreRequest: ...,
  } satisfies AdminUpdateGenreOperationRequest;

  try {
    const data = await api.adminUpdateGenre(body);
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
| **adminUpdateGenreRequest** | [AdminUpdateGenreRequest](AdminUpdateGenreRequest.md) |  | [Optional] |

### Return type

[**AdminCreateGenre201Response**](AdminCreateGenre201Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The genre was updated. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminUpdateUser

> object adminUpdateUser(id, requestBody)

Update a user

Updates user details by ID. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminUpdateUserRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    id: id_example,
    // { [key: string]: any | null; } (optional)
    requestBody: Object,
  } satisfies AdminUpdateUserRequest;

  try {
    const data = await api.adminUpdateUser(body);
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
| **requestBody** | `{ [key: string]: any | null; }` |  | [Optional] |

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
| **200** | The user was updated. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## adminUploadChapterPage

> object adminUploadChapterPage(comicId, id, file, pageNumber, width, height)

Upload a chapter page

Uploads a single page image for a chapter.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { AdminUploadChapterPageRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // string
    comicId: comicId_example,
    // string
    id: id_example,
    // Blob
    file: BINARY_DATA_HERE,
    // number (optional)
    pageNumber: 56,
    // number (optional)
    width: 56,
    // number (optional)
    height: 56,
  } satisfies AdminUploadChapterPageRequest;

  try {
    const data = await api.adminUploadChapterPage(body);
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
| **comicId** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |
| **file** | `Blob` |  | [Defaults to `undefined`] |
| **pageNumber** | `number` |  | [Optional] [Defaults to `undefined`] |
| **width** | `number` |  | [Optional] [Defaults to `undefined`] |
| **height** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**object**

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | The page was uploaded. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## clearSearchSuggestionCache

> object clearSearchSuggestionCache()

Clear the search suggestion cache

Invalidates cached comic search suggestions. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { ClearSearchSuggestionCacheRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  try {
    const data = await api.clearSearchSuggestionCache();
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
| **200** | Search suggestion cache was cleared. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSystemMaintenanceStatus

> object getSystemMaintenanceStatus()

Get system maintenance status

Returns KV, analytics, storage, and synchronization status. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { GetSystemMaintenanceStatusRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  try {
    const data = await api.getSystemMaintenanceStatus();
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
| **200** | Current maintenance status. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## purgeOrphanedStorageFiles

> PurgeOrphanedStorageFiles200Response purgeOrphanedStorageFiles()

Purge orphaned storage files

Deletes storage files not associated with database records. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { PurgeOrphanedStorageFilesRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  try {
    const data = await api.purgeOrphanedStorageFiles();
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

[**PurgeOrphanedStorageFiles200Response**](PurgeOrphanedStorageFiles200Response.md)

### Authorization

[SessionCookie](../README.md#SessionCookie), [BearerToken](../README.md#BearerToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Orphaned files were purged. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## synchronizeViewCounts

> object synchronizeViewCounts()

Synchronize view counts

Synchronizes view deltas and refreshes rankings. Requires administrator access.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '@komikhq/sdk';
import type { SynchronizeViewCountsRequest } from '@komikhq/sdk';

async function example() {
  console.log("🚀 Testing @komikhq/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: SessionCookie
    apiKey: "YOUR API KEY",
    // Configure HTTP bearer authorization: BearerToken
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  try {
    const data = await api.synchronizeViewCounts();
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
| **200** | View counts and rankings were synchronized. |  -  |
| **400** | The request contains invalid input. |  -  |
| **401** | Authentication is required or the session is invalid. |  -  |
| **403** | The authenticated user is not permitted to perform this operation. |  -  |
| **404** | The requested resource was not found. |  -  |
| **409** | The request conflicts with the current resource state. |  -  |
| **500** | An unexpected server error occurred. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

