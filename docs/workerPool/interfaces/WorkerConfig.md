[**iframe-coordinator v6.3.11**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [workerPool](../README.md) / WorkerConfig

# Interface: WorkerConfig

Defined in: [workerPool.ts:10](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L10)

Data structure defining the list of web workers, and any environmental data
they may need for initialization.

## Properties

### clients

> **clients**: [`WorkerRegistry`](WorkerRegistry.md)

Defined in: [workerPool.ts:12](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L12)

Web worker registrations

***

### envData

> **envData**: `EnvData`

Defined in: [workerPool.ts:14](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L14)

Information about the host environment.
