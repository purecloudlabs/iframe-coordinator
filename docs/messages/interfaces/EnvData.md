[**iframe-coordinator v6.5.1**](../../README.md)

---

[iframe-coordinator](../../modules.md) / [messages](../README.md) / EnvData

# Interface: EnvData

Defined in: [messages/Lifecycle.ts:33](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/messages/Lifecycle.ts#L33)

Environmental data provided to all clients
in order to match behavior of the host application.

## Properties

### custom?

> `optional` **custom**: `any`

Defined in: [messages/Lifecycle.ts:41](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/messages/Lifecycle.ts#L41)

Extra application-specific details for your use case

---

### hostRootUrl

> **hostRootUrl**: `string`

Defined in: [messages/Lifecycle.ts:37](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/messages/Lifecycle.ts#L37)

The location of the host app. Useful for building URLs that reference host pages

---

### locale

> **locale**: `string`

Defined in: [messages/Lifecycle.ts:35](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/messages/Lifecycle.ts#L35)

The locale in use by the host app, which the client application should also use.

---

### registeredKeys?

> `optional` **registeredKeys**: [`KeyData`](KeyData.md)[]

Defined in: [messages/Lifecycle.ts:39](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/messages/Lifecycle.ts#L39)

Keys to notify keypress events to the host on. This can be used to create global keyboard shortcuts.
