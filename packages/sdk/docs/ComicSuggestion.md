
# ComicSuggestion


## Properties

Name | Type
------------ | -------------
`uuid` | string
`slug` | string
`title` | string
`matchedTitle` | string
`coverUrl` | string
`type` | string
`status` | string

## Example

```typescript
import type { ComicSuggestion } from '@komikhq/sdk'

// TODO: Update the object below with actual values
const example = {
  "uuid": null,
  "slug": null,
  "title": null,
  "matchedTitle": null,
  "coverUrl": null,
  "type": null,
  "status": null,
} satisfies ComicSuggestion

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ComicSuggestion
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


