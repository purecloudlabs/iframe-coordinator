[**iframe-coordinator v6.5.0**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [messages](../README.md) / NavRequest

# Interface: NavRequest

Defined in: [messages/NavRequest.ts:7](https://github.com/purecloudlabs/iframe-coordinator/blob/24a29952c135ede083858799b8f5e2a6b7ff78ef/packages/iframe-coordinator/src/messages/NavRequest.ts#L7)

The navigation request data.

## Properties

### history?

> `optional` **history**: `"push"` \| `"replace"`

Defined in: [messages/NavRequest.ts:15](https://github.com/purecloudlabs/iframe-coordinator/blob/24a29952c135ede083858799b8f5e2a6b7ff78ef/packages/iframe-coordinator/src/messages/NavRequest.ts#L15)

How the client wants the host to update the browser's session history.
Push is the default behavior (adds a new session history entry).
Replace alters the current entry so that using the back button
after navigation will skip the location you are navigating from.

***

### url

> **url**: `string`

Defined in: [messages/NavRequest.ts:9](https://github.com/purecloudlabs/iframe-coordinator/blob/24a29952c135ede083858799b8f5e2a6b7ff78ef/packages/iframe-coordinator/src/messages/NavRequest.ts#L9)

The URL the client wants the host application to navigate to
