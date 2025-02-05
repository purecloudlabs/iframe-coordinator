[**iframe-coordinator v6.4.0**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [host](../README.md) / ClientConfig

# Interface: ClientConfig

Defined in: [elements/frame-router.ts:15](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/elements/frame-router.ts#L15)

Data structure defining the list of iframe clients, their associated routes
and any environmental data required by the clients.

## Properties

### clients

> **clients**: [`RoutingMap`](RoutingMap.md)

Defined in: [elements/frame-router.ts:17](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/elements/frame-router.ts#L17)

The map of registrations for the available clients.

***

### envData

> **envData**: [`EnvData`](../../messages/interfaces/EnvData.md)

Defined in: [elements/frame-router.ts:19](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/elements/frame-router.ts#L19)

Information about the host environment.
