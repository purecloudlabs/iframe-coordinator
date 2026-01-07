[**iframe-coordinator v6.4.0**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [host](../README.md) / WorkerConfig

# Interface: WorkerConfig

Defined in: [WorkerPool.ts:10](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/WorkerPool.ts#L10)

Data structure defining the list of web workers, and any environmental data
they may need for initialization.

## Properties

### clients

> **clients**: [`WorkerRegistry`](WorkerRegistry.md)

Defined in: [WorkerPool.ts:12](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/WorkerPool.ts#L12)

Web worker registrations

***

### envData

> **envData**: [`EnvData`](../../messages/interfaces/EnvData.md)

Defined in: [WorkerPool.ts:14](https://github.com/purecloudlabs/iframe-coordinator/blob/fb480f347a30f2befa8e9d15eabcba02bb20fc20/packages/iframe-coordinator/src/WorkerPool.ts#L14)

Information about the host environment.
