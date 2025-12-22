[**iframe-coordinator v6.3.11**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [client](../README.md) / EventEmitter

# Class: EventEmitter\<T\>

Defined in: [EventEmitter.ts:58](https://github.com/purecloudlabs/iframe-coordinator/blob/bd2d3f4f4273043c84bd1155daa5293d568d782a/packages/iframe-coordinator/src/EventEmitter.ts#L58)

API for registering and unregistering event handlers. Mirrors the browser's EventTarget API.

## Type Parameters

### T

`T`

The type of event produced by the emitter.

## Methods

### addListener()

> **addListener**(`type`, `listener`): `EventEmitter`\<`T`\>

Defined in: [EventEmitter.ts:75](https://github.com/purecloudlabs/iframe-coordinator/blob/bd2d3f4f4273043c84bd1155daa5293d568d782a/packages/iframe-coordinator/src/EventEmitter.ts#L75)

Sets up a function that will be called whenever the specified event type is delivered to the target.

#### Parameters

##### type

`string`

A case-sensitive string representing the event type to listen for.

##### listener

[`EventHandler`](../type-aliases/EventHandler.md)\<`T`\>

The handler which receives a notification when an event of the specified type occurs.

#### Returns

`EventEmitter`\<`T`\>

***

### removeAllListeners()

> **removeAllListeners**(`type`): `EventEmitter`\<`T`\>

Defined in: [EventEmitter.ts:97](https://github.com/purecloudlabs/iframe-coordinator/blob/bd2d3f4f4273043c84bd1155daa5293d568d782a/packages/iframe-coordinator/src/EventEmitter.ts#L97)

Removes all event listeners previously registered with [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

#### Parameters

##### type

`string`

A string which specifies the type of event for which to remove an event listener.

#### Returns

`EventEmitter`\<`T`\>

***

### removeListener()

> **removeListener**(`type`, `listener`): `EventEmitter`\<`T`\>

Defined in: [EventEmitter.ts:85](https://github.com/purecloudlabs/iframe-coordinator/blob/bd2d3f4f4273043c84bd1155daa5293d568d782a/packages/iframe-coordinator/src/EventEmitter.ts#L85)

Removes from the event listener previously registered with [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

#### Parameters

##### type

`string`

A string which specifies the type of event for which to remove an event listener.

##### listener

[`EventHandler`](../type-aliases/EventHandler.md)\<`T`\>

The event handler to remove from the event target.

#### Returns

`EventEmitter`\<`T`\>
