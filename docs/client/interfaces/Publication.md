[**iframe-coordinator v6.4.0**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [client](../README.md) / Publication

# Interface: Publication

Defined in: [messages/Publication.ts:15](https://github.com/purecloudlabs/iframe-coordinator/blob/0927c82358918a080e4b0ebe1e2829fb81b8ba67/packages/iframe-coordinator/src/messages/Publication.ts#L15)

A pub-sub message for general-purpose messaging between hosts and clients.

## Properties

### clientId?

> `optional` **clientId**: `string`

Defined in: [messages/Publication.ts:28](https://github.com/purecloudlabs/iframe-coordinator/blob/0927c82358918a080e4b0ebe1e2829fb81b8ba67/packages/iframe-coordinator/src/messages/Publication.ts#L28)

Client the message originates from. This should not be provided when
calling client methods. The value will be ignored and the library
will replace it when delivering the message to the host.

***

### payload

> **payload**: `any`

Defined in: [messages/Publication.ts:22](https://github.com/purecloudlabs/iframe-coordinator/blob/0927c82358918a080e4b0ebe1e2829fb81b8ba67/packages/iframe-coordinator/src/messages/Publication.ts#L22)

Data to publish

***

### topic

> **topic**: `string`

Defined in: [messages/Publication.ts:20](https://github.com/purecloudlabs/iframe-coordinator/blob/0927c82358918a080e4b0ebe1e2829fb81b8ba67/packages/iframe-coordinator/src/messages/Publication.ts#L20)

The topic to publish on. The host application must be subscribed to the topic
in order to receive the message.
