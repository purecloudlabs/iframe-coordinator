[**iframe-coordinator v6.3.11**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [client](../README.md) / EnvDataHandler

# Type Alias: EnvDataHandler()

> **EnvDataHandler** = (`envData`) => `void`

Defined in: [messages/Lifecycle.ts:108](https://github.com/purecloudlabs/iframe-coordinator/blob/bd2d3f4f4273043c84bd1155daa5293d568d782a/packages/iframe-coordinator/src/messages/Lifecycle.ts#L108)

Handles new environmental data events. These should be configured
before [Client.start](../classes/Client.md#start) is called, as the host application
will send the environment data immediately after the `Client.start`
message is received.

## Parameters

### envData

[`EnvData`](../interfaces/EnvData.md)

## Returns

`void`
