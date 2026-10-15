# @komikhq/sdk@1.0.0

A TypeScript SDK client for the localhost API.

## Usage

First, install the SDK from npm.

```bash
npm install @komikhq/sdk --save
```

Next, try it out.


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


## Documentation

### API Endpoints

All URIs are relative to *http://localhost*

| Class | Method | HTTP request | Description
| ----- | ------ | ------------ | -------------
*AdministrationApi* | [**adminCreateChapter**](docs/AdministrationApi.md#admincreatechapter) | **POST** /v1/admin/comics/{comicId}/chapters | Create a chapter with pages
*AdministrationApi* | [**adminCreateComic**](docs/AdministrationApi.md#admincreatecomic) | **POST** /v1/admin/comics | Create a comic
*AdministrationApi* | [**adminCreateGenre**](docs/AdministrationApi.md#admincreategenreoperation) | **POST** /v1/admin/genres | Create a genre
*AdministrationApi* | [**adminCreateUser**](docs/AdministrationApi.md#admincreateuseroperation) | **POST** /v1/admin/users | Create a user
*AdministrationApi* | [**adminDeleteChapter**](docs/AdministrationApi.md#admindeletechapter) | **DELETE** /v1/admin/comics/{comicId}/chapters/{id} | Delete a chapter
*AdministrationApi* | [**adminDeleteComic**](docs/AdministrationApi.md#admindeletecomic) | **DELETE** /v1/admin/comics/{id} | Delete a comic
*AdministrationApi* | [**adminDeleteGenre**](docs/AdministrationApi.md#admindeletegenre) | **DELETE** /v1/admin/genres/{id} | Delete a genre
*AdministrationApi* | [**adminDeleteUser**](docs/AdministrationApi.md#admindeleteuser) | **DELETE** /v1/admin/users/{id} | Delete a user
*AdministrationApi* | [**adminFinalizeChapter**](docs/AdministrationApi.md#adminfinalizechapteroperation) | **POST** /v1/admin/comics/{comicId}/chapters/{id}/finalize | Finalize a chapter
*AdministrationApi* | [**adminGetChapter**](docs/AdministrationApi.md#admingetchapter) | **GET** /v1/admin/comics/{comicId}/chapters/{id} | Get chapter details
*AdministrationApi* | [**adminGetComic**](docs/AdministrationApi.md#admingetcomic) | **GET** /v1/admin/comics/{id} | Get comic details
*AdministrationApi* | [**adminGetPlatformStats**](docs/AdministrationApi.md#admingetplatformstats) | **GET** /v1/admin/stats | Get platform statistics
*AdministrationApi* | [**adminInitializeChapter**](docs/AdministrationApi.md#admininitializechapteroperation) | **POST** /v1/admin/comics/{comicId}/chapters/init | Initialize a chapter upload
*AdministrationApi* | [**adminListChapters**](docs/AdministrationApi.md#adminlistchapters) | **GET** /v1/admin/comics/{comicId}/chapters | List comic chapters
*AdministrationApi* | [**adminListComics**](docs/AdministrationApi.md#adminlistcomics) | **GET** /v1/admin/comics | List comics
*AdministrationApi* | [**adminListGenres**](docs/AdministrationApi.md#adminlistgenres) | **GET** /v1/admin/genres | List all genres
*AdministrationApi* | [**adminListUsers**](docs/AdministrationApi.md#adminlistusers) | **GET** /v1/admin/users | List users
*AdministrationApi* | [**adminUpdateChapter**](docs/AdministrationApi.md#adminupdatechapter) | **PUT** /v1/admin/comics/{comicId}/chapters/{id} | Update chapter metadata
*AdministrationApi* | [**adminUpdateComic**](docs/AdministrationApi.md#adminupdatecomic) | **PUT** /v1/admin/comics/{id} | Update a comic
*AdministrationApi* | [**adminUpdateGenre**](docs/AdministrationApi.md#adminupdategenreoperation) | **PUT** /v1/admin/genres/{id} | Update a genre
*AdministrationApi* | [**adminUpdateUser**](docs/AdministrationApi.md#adminupdateuser) | **PUT** /v1/admin/users/{id} | Update a user
*AdministrationApi* | [**adminUploadChapterPage**](docs/AdministrationApi.md#adminuploadchapterpage) | **POST** /v1/admin/comics/{comicId}/chapters/{id}/pages/upload | Upload a chapter page
*AdministrationApi* | [**clearSearchSuggestionCache**](docs/AdministrationApi.md#clearsearchsuggestioncache) | **POST** /v1/admin/system/clear-search-cache | Clear the search suggestion cache
*AdministrationApi* | [**getSystemMaintenanceStatus**](docs/AdministrationApi.md#getsystemmaintenancestatus) | **GET** /v1/admin/system/maintenance-status | Get system maintenance status
*AdministrationApi* | [**purgeOrphanedStorageFiles**](docs/AdministrationApi.md#purgeorphanedstoragefiles) | **POST** /v1/admin/storage/purge-orphans | Purge orphaned storage files
*AdministrationApi* | [**synchronizeViewCounts**](docs/AdministrationApi.md#synchronizeviewcounts) | **POST** /v1/admin/system/sync-views | Synchronize view counts
*AuthenticationApi* | [**getAuthSession**](docs/AuthenticationApi.md#getauthsession) | **GET** /v1/auth/get-session | Get the current authentication session
*AuthenticationApi* | [**requestPasswordReset**](docs/AuthenticationApi.md#requestpasswordresetoperation) | **POST** /v1/auth/forget-password | Request a password reset
*AuthenticationApi* | [**resetPassword**](docs/AuthenticationApi.md#resetpasswordoperation) | **POST** /v1/auth/reset-password | Reset a password
*AuthenticationApi* | [**signInWithEmail**](docs/AuthenticationApi.md#signinwithemailoperation) | **POST** /v1/auth/sign-in/email | Sign in with email and password
*AuthenticationApi* | [**signInWithSocialProvider**](docs/AuthenticationApi.md#signinwithsocialprovideroperation) | **POST** /v1/auth/sign-in/social | Start social sign-in
*AuthenticationApi* | [**signOut**](docs/AuthenticationApi.md#signout) | **POST** /v1/auth/sign-out | Sign out
*AuthenticationApi* | [**signUpWithEmail**](docs/AuthenticationApi.md#signupwithemailoperation) | **POST** /v1/auth/sign-up/email | Create an account with email and password
*AuthenticationApi* | [**verifyEmail**](docs/AuthenticationApi.md#verifyemail) | **GET** /v1/auth/verify-email | Verify an email address
*BookmarksApi* | [**listBookmarks**](docs/BookmarksApi.md#listbookmarks) | **GET** /v1/bookmarks | List the current user\&#39;s bookmarks
*BookmarksApi* | [**removeBookmark**](docs/BookmarksApi.md#removebookmark) | **DELETE** /v1/bookmarks/{comicId} | Remove a bookmark
*BookmarksApi* | [**saveBookmark**](docs/BookmarksApi.md#savebookmarkoperation) | **POST** /v1/bookmarks | Create or update a bookmark
*ChaptersApi* | [**getPublicChapter**](docs/ChaptersApi.md#getpublicchapter) | **GET** /v1/comics/{slug}/chapters/{chapterSlug} | Get a public comic chapter
*ComicsApi* | [**browseComics**](docs/ComicsApi.md#browsecomics) | **GET** /v1/comics/browse | Browse and search comics
*ComicsApi* | [**getComicBySlug**](docs/ComicsApi.md#getcomicbyslug) | **GET** /v1/comics/{slug} | Get a comic by slug
*ComicsApi* | [**listComics**](docs/ComicsApi.md#listcomics) | **GET** /v1/comics | List comics
*ComicsApi* | [**listTrendingComics**](docs/ComicsApi.md#listtrendingcomics) | **GET** /v1/comics/trending | List trending comics
*CommentsApi* | [**createComment**](docs/CommentsApi.md#createcommentoperation) | **POST** /v1/comments | Post a comment
*CommentsApi* | [**deleteComment**](docs/CommentsApi.md#deletecomment) | **DELETE** /v1/comments/{commentId} | Delete a comment
*CommentsApi* | [**listComments**](docs/CommentsApi.md#listcomments) | **GET** /v1/comments | List comments
*CommentsApi* | [**reportComment**](docs/CommentsApi.md#reportcommentoperation) | **POST** /v1/comments/{commentId}/report | Report a comment
*CommentsApi* | [**toggleCommentLike**](docs/CommentsApi.md#togglecommentlike) | **POST** /v1/comments/{commentId}/like | Toggle a comment like
*GenresApi* | [**listGenres**](docs/GenresApi.md#listgenres) | **GET** /v1/genres | List comic genres
*HealthApi* | [**getHealth**](docs/HealthApi.md#gethealth) | **GET** /health | Check API health
*ModerationApi* | [**adminListModerationReports**](docs/ModerationApi.md#adminlistmoderationreports) | **GET** /v1/admin/reports | List moderation reports
*ModerationApi* | [**adminResolveModerationReport**](docs/ModerationApi.md#adminresolvemoderationreportoperation) | **POST** /v1/admin/reports/{id}/action | Resolve a moderation report
*RatingsApi* | [**submitComicRating**](docs/RatingsApi.md#submitcomicratingoperation) | **POST** /v1/ratings | Submit a comic rating
*ReadingHistoryApi* | [**listReadingHistory**](docs/ReadingHistoryApi.md#listreadinghistory) | **GET** /v1/history | List the current user\&#39;s reading history
*ReadingHistoryApi* | [**recordReadingProgress**](docs/ReadingHistoryApi.md#recordreadingprogressoperation) | **POST** /v1/history | Record reading progress
*RealtimeApi* | [**authorizeRealtimeChannel**](docs/RealtimeApi.md#authorizerealtimechannel) | **POST** /v1/realtime/auth | Authorize a realtime channel
*RealtimeApi* | [**connectRealtimeWebSocket**](docs/RealtimeApi.md#connectrealtimewebsocket) | **GET** /v1/realtime/ws | Connect to a realtime WebSocket
*SearchApi* | [**getComicSearchSuggestions**](docs/SearchApi.md#getcomicsearchsuggestions) | **GET** /v1/search/suggestions | Get comic search suggestions
*SitemapsApi* | [**getChaptersXmlSitemap**](docs/SitemapsApi.md#getchaptersxmlsitemap) | **GET** /sitemap-chapters.xml | Get the chapters XML sitemap
*SitemapsApi* | [**getComicsXmlSitemap**](docs/SitemapsApi.md#getcomicsxmlsitemap) | **GET** /sitemap-comics.xml | Get the comics XML sitemap
*SitemapsApi* | [**getSitemapSummary**](docs/SitemapsApi.md#getsitemapsummary) | **GET** /v1/sitemaps/summary | Get sitemap update summary
*SitemapsApi* | [**listSitemapChapters**](docs/SitemapsApi.md#listsitemapchapters) | **GET** /v1/sitemaps/chapters | List chapters for sitemap generation
*SitemapsApi* | [**listSitemapComics**](docs/SitemapsApi.md#listsitemapcomics) | **GET** /v1/sitemaps/comics | List comics for sitemap generation
*UsersApi* | [**deleteUserAccount**](docs/UsersApi.md#deleteuseraccountoperation) | **DELETE** /v1/user/profile | Delete the current user\&#39;s account
*UsersApi* | [**getUserProfile**](docs/UsersApi.md#getuserprofile) | **GET** /v1/user/profile | Get the current user\&#39;s profile
*UsersApi* | [**uploadUserAvatar**](docs/UsersApi.md#uploaduseravatar) | **POST** /v1/user/avatar | Upload a profile avatar
*ViewsApi* | [**recordComicView**](docs/ViewsApi.md#recordcomicviewoperation) | **POST** /v1/view | Record a comic or chapter view


### Models

- [AdminCreateComic201Response](docs/AdminCreateComic201Response.md)
- [AdminCreateComicRequestAlternateTitles](docs/AdminCreateComicRequestAlternateTitles.md)
- [AdminCreateGenre201Response](docs/AdminCreateGenre201Response.md)
- [AdminCreateGenreRequest](docs/AdminCreateGenreRequest.md)
- [AdminCreateUserRequest](docs/AdminCreateUserRequest.md)
- [AdminFinalizeChapterRequest](docs/AdminFinalizeChapterRequest.md)
- [AdminInitializeChapterRequest](docs/AdminInitializeChapterRequest.md)
- [AdminInitializeChapterRequestChapterNumber](docs/AdminInitializeChapterRequestChapterNumber.md)
- [AdminListGenres200Response](docs/AdminListGenres200Response.md)
- [AdminResolveModerationReportRequest](docs/AdminResolveModerationReportRequest.md)
- [AdminUpdateGenreRequest](docs/AdminUpdateGenreRequest.md)
- [ComicSuggestion](docs/ComicSuggestion.md)
- [CreateComment201Response](docs/CreateComment201Response.md)
- [CreateCommentRequest](docs/CreateCommentRequest.md)
- [DeleteUserAccount200Response](docs/DeleteUserAccount200Response.md)
- [DeleteUserAccountRequest](docs/DeleteUserAccountRequest.md)
- [ErrorResponse](docs/ErrorResponse.md)
- [Genre](docs/Genre.md)
- [GetComicSearchSuggestions200Response](docs/GetComicSearchSuggestions200Response.md)
- [GetHealth200Response](docs/GetHealth200Response.md)
- [GetHealth200ResponseServices](docs/GetHealth200ResponseServices.md)
- [GetSitemapSummary200Response](docs/GetSitemapSummary200Response.md)
- [ListBookmarks200Response](docs/ListBookmarks200Response.md)
- [ListComics200Response](docs/ListComics200Response.md)
- [ListComments200Response](docs/ListComments200Response.md)
- [ListGenres200Response](docs/ListGenres200Response.md)
- [ListReadingHistory200Response](docs/ListReadingHistory200Response.md)
- [ListSitemapChapters200Response](docs/ListSitemapChapters200Response.md)
- [ListSitemapComics200Response](docs/ListSitemapComics200Response.md)
- [ListTrendingComics200Response](docs/ListTrendingComics200Response.md)
- [PurgeOrphanedStorageFiles200Response](docs/PurgeOrphanedStorageFiles200Response.md)
- [RecordComicViewRequest](docs/RecordComicViewRequest.md)
- [RecordReadingProgressRequest](docs/RecordReadingProgressRequest.md)
- [ReportComment201Response](docs/ReportComment201Response.md)
- [ReportCommentRequest](docs/ReportCommentRequest.md)
- [RequestPasswordResetRequest](docs/RequestPasswordResetRequest.md)
- [ResetPasswordRequest](docs/ResetPasswordRequest.md)
- [SaveBookmarkRequest](docs/SaveBookmarkRequest.md)
- [SignInWithEmailRequest](docs/SignInWithEmailRequest.md)
- [SignInWithSocialProviderRequest](docs/SignInWithSocialProviderRequest.md)
- [SignUpWithEmailRequest](docs/SignUpWithEmailRequest.md)
- [SubmitComicRating200Response](docs/SubmitComicRating200Response.md)
- [SubmitComicRatingRequest](docs/SubmitComicRatingRequest.md)
- [UploadUserAvatar200Response](docs/UploadUserAvatar200Response.md)

### Authorization


Authentication schemes defined for the API:
<a id="SessionCookie"></a>
#### SessionCookie


- **Type**: API key
- **API key parameter name**: `komikhq.session_token`
- **Location**: 
<a id="BearerToken"></a>
#### BearerToken


- **Type**: HTTP Bearer Token authentication

## About

This TypeScript SDK client supports the [Fetch API](https://fetch.spec.whatwg.org/)
and is automatically generated by the
[OpenAPI Generator](https://openapi-generator.tech) project:

- API version: `1.0.0`
- Package version: `1.0.0`
- Generator version: `7.26.0`
- Build package: `org.openapitools.codegen.languages.TypeScriptFetchClientCodegen`

The generated npm module supports the following:

- Environments
  * Node.js
  * Webpack
  * Browserify
- Language levels
  * ES5 - you must have a Promises/A+ library installed
  * ES6
- Module systems
  * CommonJS
  * ES6 module system


## Development

### Building

To build the TypeScript source code, you need to have Node.js and npm installed.
After cloning the repository, navigate to the project directory and run:

```bash
npm install
npm run build
```

### Publishing

Once you've built the package, you can publish it to npm:

```bash
npm publish
```

## License

[]()
