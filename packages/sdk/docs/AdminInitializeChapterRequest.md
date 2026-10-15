
# AdminInitializeChapterRequest


## Properties

Name | Type
------------ | -------------
`chapterNumber` | [AdminInitializeChapterRequestChapterNumber](AdminInitializeChapterRequestChapterNumber.md)
`title` | string
`accessTier` | string
`isEarlyAccess` | boolean
`totalPages` | number

## Example

```typescript
import type { AdminInitializeChapterRequest } from '@komikhq/sdk'

// TODO: Update the object below with actual values
const example = {
  "chapterNumber": null,
  "title": null,
  "accessTier": null,
  "isEarlyAccess": null,
  "totalPages": null,
} satisfies AdminInitializeChapterRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AdminInitializeChapterRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


