[**iframe-coordinator v6.3.11**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [workerClient](../README.md) / WorkerClient

# Class: WorkerClient

Defined in: [workerClient.ts:4](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/workerClient.ts#L4)

## Extends

- `IfcClient`\<`DedicatedWorkerGlobalScope`\>

## Constructors

### Constructor

> **new WorkerClient**(): `WorkerClient`

Defined in: [workerClient.ts:8](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/workerClient.ts#L8)

Creates a new client.

#### Returns

`WorkerClient`

#### Overrides

`IfcClient<DedicatedWorkerGlobalScope>.constructor`

## Accessors

### environmentData

#### Get Signature

> **get** **environmentData**(): `EnvData`

Defined in: [baseClient.ts:183](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L183)

Gets the environmental data provided by the host application. This includes
the locale the client should use, the base URL of the host app, and any
custom data sent by the host.

##### Returns

`EnvData`

#### Inherited from

`IfcClient.environmentData`

***

### messaging

#### Get Signature

> **get** **messaging**(): `EventEmitter`\<`Publication`\>

Defined in: [baseClient.ts:283](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L283)

Accessor for the general-purpose pub-sub bus between client and host applications.
The content of messages on this bus are not defined by this API beyond a basic
data wrapper of topic and payload. This is for application-specific messages
agreed upon as a shared API between host and client.

##### Returns

`EventEmitter`\<`Publication`\>

#### Inherited from

`IfcClient.messaging`

## Methods

### addListener()

> **addListener**(`type`, `listener`): `IfcClient`\<`DedicatedWorkerGlobalScope`\>

Defined in: [baseClient.ts:81](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L81)

Sets up a function that will be called whenever the specified event type is delivered to the target.
This should not be confused with the general-purpose pub-sub listeners that can be set via the
IfcClient.messaging \| messaging interface.

#### Parameters

##### type

`"environmentalData"`

A case-sensitive string representing the event type to listen for. Currently, hosts only
send `environmentalData` events.

##### listener

`EnvDataHandler`

The handler which receives a notification when an event of the specified type occurs.

#### Returns

`IfcClient`\<`DedicatedWorkerGlobalScope`\>

#### Inherited from

`IfcClient.addListener`

***

### ~~asHostUrl()~~

> **asHostUrl**(`clientRouteLegacy`): `string`

Defined in: [baseClient.ts:226](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L226)

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

`IfcClient.asHostUrl`

***

### clearPromptOnLeave()

> **clearPromptOnLeave**(): `void`

Defined in: [baseClient.ts:401](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L401)

Asks the host application to clear the prompt on leave dialog.

#### Returns

`void`

#### Inherited from

`IfcClient.clearPromptOnLeave`

***

### publish()

> **publish**(`publication`): `void`

Defined in: [baseClient.ts:305](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L305)

Publish a general message to the host application.

#### Parameters

##### publication

`Publication`

The data object to be published.

#### Returns

`void`

#### Inherited from

`IfcClient.publish`

***

### removeAllListeners()

> **removeAllListeners**(`type`): `IfcClient`\<`DedicatedWorkerGlobalScope`\>

Defined in: [baseClient.ts:106](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L106)

Removes all event listeners previously registered with IfcClient.addListener \| addListener.

#### Parameters

##### type

`"environmentalData"`

A string which specifies the type of event for which to remove an event listener.

#### Returns

`IfcClient`\<`DedicatedWorkerGlobalScope`\>

#### Inherited from

`IfcClient.removeAllListeners`

***

### removeListener()

> **removeListener**(`type`, `listener`): `IfcClient`\<`DedicatedWorkerGlobalScope`\>

Defined in: [baseClient.ts:94](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L94)

Removes an event listener previously registered with IfcClient.addListener \| addListener.

#### Parameters

##### type

`"environmentalData"`

A string which specifies the type of event for which to remove an event listener.

##### listener

`EnvDataHandler`

The event handler to remove from the event target.

#### Returns

`IfcClient`\<`DedicatedWorkerGlobalScope`\>

#### Inherited from

`IfcClient.removeListener`

***

### requestModal()

> **requestModal**(`modalRequest`): `void`

Defined in: [baseClient.ts:321](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L321)

Asks the host application to open a modal dialog.

The modalId property names the modal that should be displayed
Data passed via the modalData property can be used by the host application to set up initial state specific to that modal

#### Parameters

##### modalRequest

`ModalRequest`

the ID and any data specific to the modal instance required

#### Returns

`void`

#### Inherited from

`IfcClient.requestModal`

***

### requestNavigation()

> **requestNavigation**(`destination`): `void`

Defined in: [baseClient.ts:381](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L381)

Asks the host application to navigate to a new location.

By requesting navigation from the host app instead of navigating directly in the client frame,
a host-client pair can maintain a consistent browser history even if the client frame is removed
from the page in some situations. It also helps avoid any corner-case differences in how older
browsers handle iframe history

#### Parameters

##### destination

`NavRequest`

a description of where the client wants to navigate the app to.

#### Returns

`void`

#### Inherited from

`IfcClient.requestNavigation`

***

### requestNotification()

> **requestNotification**(`notification`): `void`

Defined in: [baseClient.ts:363](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L363)

Asks the host application to display a user notification.

The page embedding the client app is responsible for handling the fired custom event and
presenting/styling the notification.  Application-specific concerns such as level, TTLs,
ids for action callbacks (notification click, notification action buttons), etc. can be passed via
the `custom` property of the `notification` type.

#### Parameters

##### notification

`Notification`

the desired notification configuration.

#### Returns

`void`

#### Examples

```typescript
client.requestNotification({ title: 'Hello world' });
```

```typescript
client.requestNotification({
  title: 'Hello',
  message: 'World'
});
```

```typescript
client.requestNotification({
  title: 'Hello',
  message: 'World',
  custom: {
    displaySeconds: 5,
    level: 'info'
  }
});
```

#### Inherited from

`IfcClient.requestNotification`

***

### requestPromptOnLeave()

> **requestPromptOnLeave**(`messagePrompt?`): `void`

Defined in: [baseClient.ts:391](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L391)

Asks the host application to display a prompt on leave dialog.

#### Parameters

##### messagePrompt?

`string`

#### Returns

`void`

#### Inherited from

`IfcClient.requestPromptOnLeave`

***

### sendPageMetadata()

> **sendPageMetadata**(`metadata`): `void`

Defined in: [baseClient.ts:417](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L417)

Sends page metadata to host for display and browser settings

title property is for the page title in the browser
breadcrumbs is an array of breadcrumb data for display in host application
custom is any custom data wanting to be sent by client app

#### Parameters

##### metadata

`PageMetadata`

data that will be used for display in host application and browser page title

#### Returns

`void`

#### Inherited from

`IfcClient.sendPageMetadata`

***

### start()

> **start**(): `void`

Defined in: [baseClient.ts:266](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L266)

Initiates responding to events triggered by the host application.

#### Returns

`void`

#### Inherited from

`IfcClient.start`

***

### stop()

> **stop**(): `void`

Defined in: [baseClient.ts:291](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L291)

Disconnects this client from the host application. This is mostly provided for
the sake of API completeness. It's unlikely to be used by most applications.

#### Returns

`void`

#### Inherited from

`IfcClient.stop`

***

### urlFromClientPath()

> **urlFromClientPath**(`clientRoute`): `string`

Defined in: [baseClient.ts:196](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L196)

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

`IfcClient.urlFromClientPath`

***

### urlFromHostPath()

> **urlFromHostPath**(`hostRoute`): `string`

Defined in: [baseClient.ts:212](https://github.com/purecloudlabs/iframe-coordinator/blob/dfc24a6ef16297e683341ab30da161b99a839afa/packages/iframe-coordinator/src/baseClient.ts#L212)

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

`IfcClient.urlFromHostPath`
