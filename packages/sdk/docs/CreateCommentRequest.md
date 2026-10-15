
# CreateCommentRequest


## Properties

Name | Type
------------ | -------------
`comicId` | string
`chapterId` | string
`content` | string
`guestName` | string
`guestEmail` | string

## Example

```typescript
import type { CreateCommentRequest } from '@komikhq/sdk'

// TODO: Update the object below with actual values
const example = {
  "comicId": null,
  "chapterId": null,
  "content": null,
  "guestName": null,
  "guestEmail": null,
} satisfies CreateCommentRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateCommentRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


