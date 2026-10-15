
# RecordReadingProgressRequest


## Properties

Name | Type
------------ | -------------
`comicId` | string
`chapterId` | string
`lastReadPage` | number
`snapshotTotalPages` | number

## Example

```typescript
import type { RecordReadingProgressRequest } from '@komikhq/sdk'

// TODO: Update the object below with actual values
const example = {
  "comicId": null,
  "chapterId": null,
  "lastReadPage": null,
  "snapshotTotalPages": null,
} satisfies RecordReadingProgressRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecordReadingProgressRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


