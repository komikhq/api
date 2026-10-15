
# ResetPasswordRequest


## Properties

Name | Type
------------ | -------------
`newPassword` | string
`token` | string

## Example

```typescript
import type { ResetPasswordRequest } from '@komikhq/sdk'

// TODO: Update the object below with actual values
const example = {
  "newPassword": null,
  "token": null,
} satisfies ResetPasswordRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ResetPasswordRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


