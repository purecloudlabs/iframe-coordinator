[**iframe-coordinator v6.5.0**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [host](../README.md) / WorkerConfig

# Interface: WorkerConfig

Defined in: [WorkerPool.ts:10](https://github.com/purecloudlabs/iframe-coordinator/blob/24a29952c135ede083858799b8f5e2a6b7ff78ef/packages/iframe-coordinator/src/WorkerPool.ts#L10)

Data structure defining the list of web workers, and any environmental data
they may need for initialization.

## Properties

### clients

> **clients**: [`WorkerRegistry`](WorkerRegistry.md)

Defined in: [WorkerPool.ts:12](https://github.com/purecloudlabs/iframe-coordinator/blob/24a29952c135ede083858799b8f5e2a6b7ff78ef/packages/iframe-coordinator/src/WorkerPool.ts#L12)

Web worker registrations

***

### envData

> **envData**: [`EnvData`](../../messages/interfaces/EnvData.md)

Defined in: [WorkerPool.ts:14](https://github.com/purecloudlabs/iframe-coordinator/blob/24a29952c135ede083858799b8f5e2a6b7ff78ef/packages/iframe-coordinator/src/WorkerPool.ts#L14)

Information about the host environment.
