[**iframe-coordinator v6.3.11**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [host](../README.md) / ClientConfig

# Interface: ClientConfig

Defined in: [elements/frame-router.ts:15](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/elements/frame-router.ts#L15)

Data structure defining the list of iframe clients, their associated routes
and any environmental data required by the clients.

## Properties

### clients

> **clients**: [`RoutingMap`](RoutingMap.md)

Defined in: [elements/frame-router.ts:17](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/elements/frame-router.ts#L17)

The map of registrations for the available clients.

***

### envData

> **envData**: `EnvData`

Defined in: [elements/frame-router.ts:19](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/elements/frame-router.ts#L19)

Information about the host environment.
