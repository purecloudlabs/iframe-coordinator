[**iframe-coordinator v6.3.11**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [workerPool](../README.md) / WorkerPool

# Class: WorkerPool

Defined in: [workerPool.ts:53](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L53)

Class for managing a collection of worker processes. The WorkerPool is an
EventTarget and emits events in the same way as the [FrameRouterElement](../../host/classes/FrameRouterElement.md),
although with fewer possible events.

## Extends

- `EventTarget`

## Constructors

### Constructor

> **new WorkerPool**(): `WorkerPool`

Defined in: [workerPool.ts:88](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L88)

Creates a new worker pool

#### Returns

`WorkerPool`

#### Overrides

`EventTarget.constructor`

## Accessors

### isRunning

#### Get Signature

> **get** **isRunning**(): `boolean`

Defined in: [workerPool.ts:119](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L119)

True if the worker is running.

##### Returns

`boolean`

***

### workerConfig

#### Get Signature

> **get** **workerConfig**(): [`WorkerConfig`](../interfaces/WorkerConfig.md)

Defined in: [workerPool.ts:112](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L112)

Get the configured workers for the pool.

##### Returns

[`WorkerConfig`](../interfaces/WorkerConfig.md)

#### Set Signature

> **set** **workerConfig**(`clientConfig`): `void`

Defined in: [workerPool.ts:101](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L101)

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

Defined in: [workerPool.ts:170](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L170)

Publish a message to a worker.

#### Parameters

##### clientId

`string`

The id of the worker the message should be published to

##### publication

`Publication`

The information published to the woker.
The topic may not be of interest, and could be ignored.

#### Returns

`void`

***

### start()

> **start**(): `void`

Defined in: [workerPool.ts:126](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L126)

Start the worker pool, and all associated workers.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [workerPool.ts:150](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L150)

Stops the worker pool, immediately terminating all registered workers. Does
nothing if the pool was never started.

#### Returns

`void`
