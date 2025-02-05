[**iframe-coordinator v6.4.0**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [host](../README.md) / WorkerPool

# Class: WorkerPool

Defined in: [WorkerPool.ts:59](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/WorkerPool.ts#L59)

Class for managing a collection of worker processes that should run for the
lifetime of the host application. Workers can be provided with basic
application metadata, allowing them to generate URLs for and request
navigation to a corresponding iframed client app that may or may not be
currently loaded.

The WorkerPool is an [EventTarget](https://developer.mozilla.org/docs/Web/API/EventTarget) and emits events in the same way as the
[FrameRouterElement](FrameRouterElement.md), although with fewer
possible events.

## Extends

- [`EventTarget`](https://developer.mozilla.org/docs/Web/API/EventTarget)

## Constructors

### Constructor

> **new WorkerPool**(): `WorkerPool`

Defined in: [WorkerPool.ts:94](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/WorkerPool.ts#L94)

Creates a new worker pool

#### Returns

`WorkerPool`

#### Overrides

`EventTarget.constructor`

## Accessors

### isRunning

#### Get Signature

> **get** **isRunning**(): `boolean`

Defined in: [WorkerPool.ts:125](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/WorkerPool.ts#L125)

True if the worker is running.

##### Returns

`boolean`

***

### workerConfig

#### Get Signature

> **get** **workerConfig**(): [`WorkerConfig`](../interfaces/WorkerConfig.md)

Defined in: [WorkerPool.ts:118](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/WorkerPool.ts#L118)

Get the configured workers for the pool.

##### Returns

[`WorkerConfig`](../interfaces/WorkerConfig.md)

#### Set Signature

> **set** **workerConfig**(`clientConfig`): `void`

Defined in: [WorkerPool.ts:107](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/WorkerPool.ts#L107)

Set the configured workers for the pool.

Changing this after the pool has been started will throw an Error. If you
have a need to dynamically change the set of running workers, please reach
out with your use case.

##### Parameters

###### clientConfig

[`WorkerConfig`](../interfaces/WorkerConfig.md)

##### Returns

`void`

## Methods

### publish()

> **publish**(`clientId`, `publication`): `void`

Defined in: [WorkerPool.ts:176](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/WorkerPool.ts#L176)

Publish a message to a worker.

#### Parameters

##### clientId

`string`

The id of the worker the message should be published to

##### publication

[`Publication`](../../messages/interfaces/Publication.md)

The information published to the woker.
The topic may not be of interest, and could be ignored.

#### Returns

`void`

***

### start()

> **start**(): `void`

Defined in: [WorkerPool.ts:132](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/WorkerPool.ts#L132)

Start the worker pool, and all associated workers.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [WorkerPool.ts:156](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/WorkerPool.ts#L156)

Stops the worker pool, immediately terminating all registered workers. Does
nothing if the pool was never started.

#### Returns

`void`
