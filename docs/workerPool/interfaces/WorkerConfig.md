[**iframe-coordinator v6.3.11**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [workerPool](../README.md) / WorkerConfig

# Interface: WorkerConfig

Defined in: [workerPool.ts:10](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/workerPool.ts#L10)

Data structure defining the list of web workers, and any environmental data
they may need for initialization.

## Properties

### clients

> **clients**: [`WorkerRegistry`](WorkerRegistry.md)

Defined in: [workerPool.ts:12](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/workerPool.ts#L12)

Web worker registrations

***

### envData

> **envData**: `EnvData`

Defined in: [workerPool.ts:14](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/workerPool.ts#L14)

Information about the host environment.
