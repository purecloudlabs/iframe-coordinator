[**iframe-coordinator v6.5.1**](../../README.md)

---

[iframe-coordinator](../../modules.md) / [host](../README.md) / WorkerItem

# Interface: WorkerItem

Defined in: [WorkerPool.ts:27](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/WorkerPool.ts#L27)

Web worker metadata.

## Properties

### app

> **app**: [`WorkerAppData`](WorkerAppData.md)

Defined in: [WorkerPool.ts:31](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/WorkerPool.ts#L31)

Application metadata. Allows a worker easily generate links for an associated application

---

### script

> **script**: `string` \| [`URL`](https://developer.mozilla.org/docs/Web/API/URL)

Defined in: [WorkerPool.ts:29](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/WorkerPool.ts#L29)

The script to run for the worker
