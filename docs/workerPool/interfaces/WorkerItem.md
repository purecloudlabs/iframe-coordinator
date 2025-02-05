[**iframe-coordinator v6.3.11**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [workerPool](../README.md) / WorkerItem

# Interface: WorkerItem

Defined in: [workerPool.ts:27](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L27)

Web worker metadata.

## Properties

### app

> **app**: [`AppData`](AppData.md)

Defined in: [workerPool.ts:31](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L31)

Application metadata. Allows a worker easily generate links for an associated application

***

### script

> **script**: `string` \| `URL`

Defined in: [workerPool.ts:29](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/workerPool.ts#L29)

The script to run for the worker
