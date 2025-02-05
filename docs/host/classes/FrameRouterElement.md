[**iframe-coordinator v6.4.0**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [host](../README.md) / FrameRouterElement

# Class: FrameRouterElement

Defined in: [elements/frame-router.ts:30](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/elements/frame-router.ts#L30)

A custom element responsible for rendering an iframe and communicating with
configured client applications that will render in that frame. It will be
registered as `frame-router` by a call to [[registerCustomElements]] and
should not be created directly. Instead, add a `<frame-router>` element to your
markup or use `document.createElement('frame-router')` after calling
[[registerCustomElements]].

## Extends

- [`HTMLElement`](https://developer.mozilla.org/docs/Web/API/HTMLElement)

## Accessors

### clientConfig

#### Get Signature

> **get** **clientConfig**(): [`ClientConfig`](../interfaces/ClientConfig.md)

Defined in: [elements/frame-router.ts:188](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/elements/frame-router.ts#L188)

A property that can be set to initialize the host frame

##### Returns

[`ClientConfig`](../interfaces/ClientConfig.md)

#### Set Signature

> **set** **clientConfig**(`clientConfig`): `void`

Defined in: [elements/frame-router.ts:192](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/elements/frame-router.ts#L192)

##### Parameters

###### clientConfig

[`ClientConfig`](../interfaces/ClientConfig.md)

##### Returns

`void`

***

### messaging

#### Get Signature

> **get** **messaging**(): [`EventEmitter`](../../client/interfaces/EventEmitter.md)\<[`Publication`](../../messages/interfaces/Publication.md)\>

Defined in: [elements/frame-router.ts:104](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/elements/frame-router.ts#L104)

Eventing for published messages from the host application.

##### Returns

[`EventEmitter`](../../client/interfaces/EventEmitter.md)\<[`Publication`](../../messages/interfaces/Publication.md)\>

## Methods

### changeRoute()

> **changeRoute**(`newPath`): `void`

Defined in: [elements/frame-router.ts:126](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/elements/frame-router.ts#L126)

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

Defined in: [elements/frame-router.ts:114](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/elements/frame-router.ts#L114)

Publish a message to the client fragment.

#### Parameters

##### publication

[`Publication`](../../messages/interfaces/Publication.md)

The information published to the client fragment.
The topic may not be of interest, and could be ignored.

#### Returns

`void`

***

### ~~setupFrames()~~

> **setupFrames**(`clients`, `envData`): `void`

Defined in: [elements/frame-router.ts:90](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/elements/frame-router.ts#L90)

Initializes this host frame with the possible clients and
the environmental data required the clients.

#### Parameters

##### clients

[`RoutingMap`](../interfaces/RoutingMap.md)

The map of registrations for the available clients.

##### envData

[`EnvData`](../../messages/interfaces/EnvData.md)

Information about the host environment.

#### Returns

`void`

#### Deprecated

Use the new [clientConfig](#clientconfig) property instead
