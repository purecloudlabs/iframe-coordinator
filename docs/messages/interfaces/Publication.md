[**iframe-coordinator v6.5.2**](../../README.md)

---

[iframe-coordinator](../../modules.md) / [messages](../README.md) / Publication

# Interface: Publication

Defined in: [messages/Publication.ts:7](https://github.com/purecloudlabs/iframe-coordinator/blob/b64efe0f09bd193da927d893bb5567bbf39a17cb/packages/iframe-coordinator/src/messages/Publication.ts#L7)

A pub-sub message for general-purpose messaging between hosts and clients.

## Properties

### clientId?

> `optional` **clientId**: `string`

Defined in: [messages/Publication.ts:20](https://github.com/purecloudlabs/iframe-coordinator/blob/b64efe0f09bd193da927d893bb5567bbf39a17cb/packages/iframe-coordinator/src/messages/Publication.ts#L20)

Client the message originates from. This should not be provided when
calling client methods. The value will be ignored and the library
will replace it when delivering the message to the host.

---

### payload?

> `optional` **payload**: `any`

Defined in: [messages/Publication.ts:14](https://github.com/purecloudlabs/iframe-coordinator/blob/b64efe0f09bd193da927d893bb5567bbf39a17cb/packages/iframe-coordinator/src/messages/Publication.ts#L14)

Data to publish

---

### topic

> **topic**: `string`

Defined in: [messages/Publication.ts:12](https://github.com/purecloudlabs/iframe-coordinator/blob/b64efe0f09bd193da927d893bb5567bbf39a17cb/packages/iframe-coordinator/src/messages/Publication.ts#L12)

The topic to publish on. The host application must be subscribed to the topic
in order to receive the message.
