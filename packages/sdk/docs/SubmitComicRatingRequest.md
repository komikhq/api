
# SubmitComicRatingRequest


## Properties

Name | Type
------------ | -------------
`comicId` | string
`score` | number

## Example

```typescript
import type { SubmitComicRatingRequest } from '@komikhq/sdk'

// TODO: Update the object below with actual values
const example = {
  "comicId": null,
  "score": null,
} satisfies SubmitComicRatingRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SubmitComicRatingRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


