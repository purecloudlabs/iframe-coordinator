[**iframe-coordinator v6.3.11**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [workerPool](../README.md) / WorkerPool

# Class: WorkerPool

Defined in: [workerPool.ts:34](https://github.com/purecloudlabs/iframe-coordinator/blob/1311ddac08caa061850b5cea195f7e2204ad0a04/packages/iframe-coordinator/src/workerPool.ts#L34)

## Extends

- `EventTarget`

## Accessors

### clientConfig

#### Get Signature

> **get** **clientConfig**(): `ClientConfig`

Defined in: [workerPool.ts:60](https://github.com/purecloudlabs/iframe-coordinator/blob/1311ddac08caa061850b5cea195f7e2204ad0a04/packages/iframe-coordinator/src/workerPool.ts#L60)

##### Returns

`ClientConfig`

#### Set Signature

> **set** **clientConfig**(`clientConfig`): `void`

Defined in: [workerPool.ts:64](https://github.com/purecloudlabs/iframe-coordinator/blob/1311ddac08caa061850b5cea195f7e2204ad0a04/packages/iframe-coordinator/src/workerPool.ts#L64)

##### Parameters

###### clientConfig

`ClientConfig`

##### Returns

`void`

## Methods

### publish()

> **publish**(`clientId`, `publication`): `void`

Defined in: [workerPool.ts:103](https://github.com/purecloudlabs/iframe-coordinator/blob/1311ddac08caa061850b5cea195f7e2204ad0a04/packages/iframe-coordinator/src/workerPool.ts#L103)

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

Defined in: [workerPool.ts:69](https://github.com/purecloudlabs/iframe-coordinator/blob/1311ddac08caa061850b5cea195f7e2204ad0a04/packages/iframe-coordinator/src/workerPool.ts#L69)

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [workerPool.ts:87](https://github.com/purecloudlabs/iframe-coordinator/blob/1311ddac08caa061850b5cea195f7e2204ad0a04/packages/iframe-coordinator/src/workerPool.ts#L87)

#### Returns

`void`
