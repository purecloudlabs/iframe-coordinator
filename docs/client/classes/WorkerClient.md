[**iframe-coordinator v6.5.1**](../../README.md)

---

[iframe-coordinator](../../modules.md) / [client](../README.md) / WorkerClient

# Class: WorkerClient

Defined in: [WorkerClient.ts:9](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/WorkerClient.ts#L9)

Client class allowing web workers to interact with the larger
iframe-coordinator feature set.

## Extends

- `AbstractClient`\<[`DedicatedWorkerGlobalScope`](https://developer.mozilla.org/docs/Web/API/DedicatedWorkerGlobalScope)\>

## Constructors

### Constructor

> **new WorkerClient**(): `WorkerClient`

Defined in: [WorkerClient.ts:13](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/WorkerClient.ts#L13)

Creates a new Web Worker client.

#### Returns

`WorkerClient`

#### Overrides

`AbstractClient<DedicatedWorkerGlobalScope>.constructor`

## Accessors

### environmentData

#### Get Signature

> **get** **environmentData**(): [`EnvData`](../../messages/interfaces/EnvData.md)

Defined in: [AbstractClient.ts:169](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L169)

Gets the environmental data provided by the host application. This includes
the locale the client should use, the base URL of the host app, and any
custom data sent by the host.

##### Returns

[`EnvData`](../../messages/interfaces/EnvData.md)

#### Inherited from

`AbstractClient.environmentData`

---

### messaging

#### Get Signature

> **get** **messaging**(): [`EventEmitter`](../interfaces/EventEmitter.md)\<[`Publication`](../../messages/interfaces/Publication.md)\>

Defined in: [AbstractClient.ts:269](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L269)

Accessor for the general-purpose pub-sub bus between client and host applications.
The content of messages on this bus are not defined by this API beyond a basic
data wrapper of topic and payload. This is for application-specific messages
agreed upon as a shared API between host and client.

##### Returns

[`EventEmitter`](../interfaces/EventEmitter.md)\<[`Publication`](../../messages/interfaces/Publication.md)\>

#### Inherited from

`AbstractClient.messaging`

## Methods

### addListener()

> **addListener**(`type`, `listener`): `this`

Defined in: [AbstractClient.ts:67](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L67)

Sets up a function that will be called whenever the specified event type is delivered to the target.
This should not be confused with the general-purpose pub-sub listeners that can be set via the
[messaging](Client.md#messaging) interface. Handlers should be set before calling [start](#start), otherwise
there is a risk of missing messages between when the host begins delivering data and the listener
is added.

#### Parameters

##### type

`"environmentalData"`

A case-sensitive string representing the event type to listen for. Currently, hosts only
send `environmentalData` events.

##### listener

[`EnvDataHandler`](../type-aliases/EnvDataHandler.md)

The handler which receives a notification when an event of the specified type occurs.

#### Returns

`this`

#### Inherited from

`AbstractClient.addListener`

---

### ~~asHostUrl()~~

> **asHostUrl**(`clientRouteLegacy`): `string`

Defined in: [AbstractClient.ts:212](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L212)

Translates a client route like `/foo/bar` to the full URL used in the host
app for the same page, e.g. `https://hostapp.com/#/client-app/foo/bar`.

#### Parameters

##### clientRouteLegacy

`string`

The /-separated path within the client app to link to.

#### Returns

`string`

#### Deprecated

Use the new [urlFromClientPath](#urlfromclientpath) method instead

#### Inherited from

`AbstractClient.asHostUrl`

---

### clearPromptOnLeave()

> **clearPromptOnLeave**(): `void`

Defined in: [AbstractClient.ts:387](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L387)

Asks the host application to clear the prompt on leave dialog.

#### Returns

`void`

#### Inherited from

`AbstractClient.clearPromptOnLeave`

---

### publish()

> **publish**(`publication`): `void`

Defined in: [AbstractClient.ts:291](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L291)

Publish a general message to the host application.

#### Parameters

##### publication

[`Publication`](../../messages/interfaces/Publication.md)

The data object to be published.

#### Returns

`void`

#### Inherited from

`AbstractClient.publish`

---

### removeAllListeners()

> **removeAllListeners**(`type`): `this`

Defined in: [AbstractClient.ts:92](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L92)

Removes all event listeners previously registered with [addListener](#addlistener).

#### Parameters

##### type

`"environmentalData"`

A string which specifies the type of event for which to remove an event listener.

#### Returns

`this`

#### Inherited from

`AbstractClient.removeAllListeners`

---

### removeListener()

> **removeListener**(`type`, `listener`): `this`

Defined in: [AbstractClient.ts:80](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L80)

Removes an event listener previously registered with [addListener](#addlistener).

#### Parameters

##### type

`"environmentalData"`

A string which specifies the type of event for which to remove an event listener.

##### listener

[`EnvDataHandler`](../type-aliases/EnvDataHandler.md)

The event handler to remove from the event target.

#### Returns

`this`

#### Inherited from

`AbstractClient.removeListener`

---

### requestModal()

> **requestModal**(`modalRequest`): `void`

Defined in: [AbstractClient.ts:307](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L307)

Asks the host application to open a modal dialog.

The modalId property names the modal that should be displayed
Data passed via the modalData property can be used by the host application to set up initial state specific to that modal

#### Parameters

##### modalRequest

[`ModalRequest`](../../messages/interfaces/ModalRequest.md)

the ID and any data specific to the modal instance required

#### Returns

`void`

#### Inherited from

`AbstractClient.requestModal`

---

### requestNavigation()

> **requestNavigation**(`destination`): `void`

Defined in: [AbstractClient.ts:367](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L367)

Asks the host application to navigate to a new location.

By requesting navigation from the host app instead of navigating directly in the client frame,
a host-client pair can maintain a consistent browser history even if the client frame is removed
from the page in some situations. It also helps avoid any corner-case differences in how older
browsers handle iframe history

#### Parameters

##### destination

[`NavRequest`](../../messages/interfaces/NavRequest.md)

a description of where the client wants to navigate the app to.

#### Returns

`void`

#### Inherited from

`AbstractClient.requestNavigation`

---

### requestNotification()

> **requestNotification**(`notification`): `void`

Defined in: [AbstractClient.ts:349](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L349)

Asks the host application to display a user notification.

The page embedding the client app is responsible for handling the fired custom event and
presenting/styling the notification. Application-specific concerns such as level, TTLs,
ids for action callbacks (notification click, notification action buttons), etc. can be passed via
the `custom` property of the `notification` type.

#### Parameters

##### notification

[`Notification`](../../messages/interfaces/Notification.md)

the desired notification configuration.

#### Returns

`void`

#### Examples

```typescript
client.requestNotification({ title: "Hello world" });
```

```typescript
client.requestNotification({
  title: "Hello",
  message: "World",
});
```

```typescript
client.requestNotification({
  title: "Hello",
  message: "World",
  custom: {
    displaySeconds: 5,
    level: "info",
  },
});
```

#### Inherited from

`AbstractClient.requestNotification`

---

### requestPromptOnLeave()

> **requestPromptOnLeave**(`messagePrompt?`): `void`

Defined in: [AbstractClient.ts:377](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L377)

Asks the host application to display a prompt on leave dialog.

#### Parameters

##### messagePrompt?

`string`

#### Returns

`void`

#### Inherited from

`AbstractClient.requestPromptOnLeave`

---

### sendPageMetadata()

> **sendPageMetadata**(`metadata`): `void`

Defined in: [AbstractClient.ts:403](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L403)

Sends page metadata to host for display and browser settings

title property is for the page title in the browser
breadcrumbs is an array of breadcrumb data for display in host application
custom is any custom data wanting to be sent by client app

#### Parameters

##### metadata

[`PageMetadata`](../../messages/interfaces/PageMetadata.md)

data that will be used for display in host application and browser page title

#### Returns

`void`

#### Inherited from

`AbstractClient.sendPageMetadata`

---

### start()

> **start**(): `void`

Defined in: [AbstractClient.ts:252](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L252)

Initiates responding to events triggered by the host application.

#### Returns

`void`

#### Inherited from

`AbstractClient.start`

---

### stop()

> **stop**(): `void`

Defined in: [AbstractClient.ts:277](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L277)

Disconnects this client from the host application. This is mostly provided for
the sake of API completeness. It's unlikely to be used by most applications.

#### Returns

`void`

#### Inherited from

`AbstractClient.stop`

---

### urlFromClientPath()

> **urlFromClientPath**(`clientRoute`): `string`

Defined in: [AbstractClient.ts:182](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L182)

Translates a client route like `/foo/bar` to the full URL used in the host
app for the same page, e.g. `https://hostapp.com/#/client-app/foo/bar`.
You should use this whenever generating an internal link within a client
application so that the user gets a nice experience if they open a link in
a new tab, or copy and paste a link URL into a chat message or email.

#### Parameters

##### clientRoute

`string`

The /-separated path within the client app to link to.

#### Returns

`string`

#### Inherited from

`AbstractClient.urlFromClientPath`

---

### urlFromHostPath()

> **urlFromHostPath**(`hostRoute`): `string`

Defined in: [AbstractClient.ts:198](https://github.com/purecloudlabs/iframe-coordinator/blob/c66985bfb186111ea5faaed3c49c76f23c1e0800/packages/iframe-coordinator/src/AbstractClient.ts#L198)

Translates a host route like `/app2` to the full URL used in the host
app, e.g. `https://hostapp.com/#/app2`.
You should use this whenever generating a host link within a client
application so that the user gets a nice experience if they open a link in
a new tab, or copy and paste a link URL into a chat message or email.

#### Parameters

##### hostRoute

`string`

The /-separated path within the host app to link to.

#### Returns

`string`

#### Inherited from

`AbstractClient.urlFromHostPath`
