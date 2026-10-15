
# ReportCommentRequest


## Properties

Name | Type
------------ | -------------
`reason` | string
`details` | string
`guestName` | string
`guestEmail` | string

## Example

```typescript
import type { ReportCommentRequest } from '@komikhq/sdk'

// TODO: Update the object below with actual values
const example = {
  "reason": null,
  "details": null,
  "guestName": null,
  "guestEmail": null,
} satisfies ReportCommentRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReportCommentRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


