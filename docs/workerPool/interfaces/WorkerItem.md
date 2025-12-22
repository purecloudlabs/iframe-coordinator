[**iframe-coordinator v6.3.11**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [workerPool](../README.md) / WorkerItem

# Interface: WorkerItem

Defined in: [workerPool.ts:27](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/workerPool.ts#L27)

Web worker metadata.

## Properties

### app

> **app**: [`AppData`](AppData.md)

Defined in: [workerPool.ts:31](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/workerPool.ts#L31)

Application metadata. Allows a worker easily generate links for an associated application

***

### script

> **script**: "string \| URL"

Defined in: [workerPool.ts:29](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/workerPool.ts#L29)

The script to run for the worker
