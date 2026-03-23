[**iframe-coordinator v6.5.1**](../../README.md)

---

[iframe-coordinator](../../modules.md) / [host](../README.md) / WorkerConfig

# Interface: WorkerConfig

Defined in: [WorkerPool.ts:10](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/WorkerPool.ts#L10)

Data structure defining the list of web workers, and any environmental data
they may need for initialization.

## Properties

### clients

> **clients**: [`WorkerRegistry`](WorkerRegistry.md)

Defined in: [WorkerPool.ts:12](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/WorkerPool.ts#L12)

Web worker registrations

---

### envData

> **envData**: [`EnvData`](../../messages/interfaces/EnvData.md)

Defined in: [WorkerPool.ts:14](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/WorkerPool.ts#L14)

Information about the host environment.
