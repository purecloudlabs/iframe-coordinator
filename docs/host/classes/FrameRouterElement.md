[**iframe-coordinator v6.4.0**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [host](../README.md) / FrameRouterElement

# Class: FrameRouterElement

Defined in: [elements/frame-router.ts:29](https://github.com/purecloudlabs/iframe-coordinator/blob/0927c82358918a080e4b0ebe1e2829fb81b8ba67/packages/iframe-coordinator/src/elements/frame-router.ts#L29)

A custom element responsible for rendering an iframe and communicating with
configured client applications that will render in that frame. It will be
registered as `frame-router` by a call to [[registerCustomElements]] and
should not be created directly. Instead, add a `<frame-router>` element to your
markup or use `document.createElement('frame-router')` after calling
[[registerCustomElements]].

## Extends

- `HTMLElement`

## Accessors

### clientConfig

#### Get Signature

> **get** **clientConfig**(): [`ClientConfig`](../interfaces/ClientConfig.md)

Defined in: [elements/frame-router.ts:187](https://github.com/purecloudlabs/iframe-coordinator/blob/0927c82358918a080e4b0ebe1e2829fb81b8ba67/packages/iframe-coordinator/src/elements/frame-router.ts#L187)

A property that can be set to initialize the host frame

##### Returns

[`ClientConfig`](../interfaces/ClientConfig.md)

#### Set Signature

> **set** **clientConfig**(`clientConfig`): `void`

Defined in: [elements/frame-router.ts:191](https://github.com/purecloudlabs/iframe-coordinator/blob/0927c82358918a080e4b0ebe1e2829fb81b8ba67/packages/iframe-coordinator/src/elements/frame-router.ts#L191)

##### Parameters

###### clientConfig

[`ClientConfig`](../interfaces/ClientConfig.md)

##### Returns

`void`

***

### messaging

#### Get Signature

> **get** **messaging**(): [`EventEmitter`](../../client/classes/EventEmitter.md)\<[`Publication`](../../client/interfaces/Publication.md)\>

Defined in: [elements/frame-router.ts:103](https://github.com/purecloudlabs/iframe-coordinator/blob/0927c82358918a080e4b0ebe1e2829fb81b8ba67/packages/iframe-coordinator/src/elements/frame-router.ts#L103)

Eventing for published messages from the host application.

##### Returns

[`EventEmitter`](../../client/classes/EventEmitter.md)\<[`Publication`](../../client/interfaces/Publication.md)\>

## Methods

### changeRoute()

> **changeRoute**(`newPath`): `void`

Defined in: [elements/frame-router.ts:125](https://github.com/purecloudlabs/iframe-coordinator/blob/0927c82358918a080e4b0ebe1e2829fb81b8ba67/packages/iframe-coordinator/src/elements/frame-router.ts#L125)

Changes the route the client fragment is rendering.

#### Parameters

##### newPath

`string`

a new route which matches those provided originally.

#### Returns

`void`

***

### publish()

> **publish**(`publication`): `void`

Defined in: [elements/frame-router.ts:113](https://github.com/purecloudlabs/iframe-coordinator/blob/0927c82358918a080e4b0ebe1e2829fb81b8ba67/packages/iframe-coordinator/src/elements/frame-router.ts#L113)

Publish a message to the client fragment.

#### Parameters

##### publication

[`Publication`](../../client/interfaces/Publication.md)

The information published to the client fragment.
The topic may not be of interest, and could be ignored.

#### Returns

`void`

***

### ~~setupFrames()~~

> **setupFrames**(`clients`, `envData`): `void`

Defined in: [elements/frame-router.ts:89](https://github.com/purecloudlabs/iframe-coordinator/blob/0927c82358918a080e4b0ebe1e2829fb81b8ba67/packages/iframe-coordinator/src/elements/frame-router.ts#L89)

Initializes this host frame with the possible clients and
the environmental data required the clients.

#### Parameters

##### clients

[`RoutingMap`](../interfaces/RoutingMap.md)

The map of registrations for the available clients.

##### envData

[`EnvData`](../../client/interfaces/EnvData.md)

Information about the host environment.

#### Returns

`void`

#### Deprecated

Use the new [clientConfig](#clientconfig) property instead
