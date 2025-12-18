[**iframe-coordinator v6.3.11**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [client](../README.md) / Client

# Class: Client

Defined in: [client.ts:65](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L65)

This class is the primary interface that an embedded iframe client should use to communicate with
the host application.

## Constructors

### Constructor

> **new Client**(`configOptions?`): `Client`

Defined in: [client.ts:80](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L80)

Creates a new client.

#### Parameters

##### configOptions?

[`ClientConfigOptions`](../interfaces/ClientConfigOptions.md)

#### Returns

`Client`

## Accessors

### environmentData

#### Get Signature

> **get** **environmentData**(): [`EnvData`](../interfaces/EnvData.md)

Defined in: [client.ts:291](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L291)

Gets the environmental data provided by the host application. This includes
the locale the client should use, the base URL of the host app, and any
custom data sent by the host.

##### Returns

[`EnvData`](../interfaces/EnvData.md)

***

### messaging

#### Get Signature

> **get** **messaging**(): [`EventEmitter`](EventEmitter.md)\<[`Publication`](../interfaces/Publication.md)\>

Defined in: [client.ts:403](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L403)

Accessor for the general-purpose pub-sub bus between client and host applications.
The content of messages on this bus are not defined by this API beyond a basic
data wrapper of topic and payload. This is for application-specific messages
agreed upon as a shared API between host and client.

##### Returns

[`EventEmitter`](EventEmitter.md)\<[`Publication`](../interfaces/Publication.md)\>

## Methods

### addListener()

> **addListener**(`type`, `listener`): `Client`

Defined in: [client.ts:134](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L134)

Sets up a function that will be called whenever the specified event type is delivered to the target.
This should not be confused with the general-purpose pub-sub listeners that can be set via the
[messaging](#messaging) interface.

#### Parameters

##### type

`"environmentalData"`

A case-sensitive string representing the event type to listen for. Currently, hosts only
send `environmentalData` events.

##### listener

[`EnvDataHandler`](../type-aliases/EnvDataHandler.md)

The handler which receives a notification when an event of the specified type occurs.

#### Returns

`Client`

***

### ~~asHostUrl()~~

> **asHostUrl**(`clientRouteLegacy`): `string`

Defined in: [client.ts:334](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L334)

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

***

### clearPromptOnLeave()

> **clearPromptOnLeave**(): `void`

Defined in: [client.ts:524](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L524)

Asks the host application to clear the prompt on leave dialog.

#### Returns

`void`

***

### publish()

> **publish**(`publication`): `void`

Defined in: [client.ts:428](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L428)

Publish a general message to the host application.

#### Parameters

##### publication

[`Publication`](../interfaces/Publication.md)

The data object to be published.

#### Returns

`void`

***

### registerCustomElements()

> **registerCustomElements**(): `void`

Defined in: [client.ts:99](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L99)

Registers custom elements used by the client application

#### Returns

`void`

***

### removeAllListeners()

> **removeAllListeners**(`type`): `Client`

Defined in: [client.ts:159](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L159)

Removes all event listeners previously registered with [addListener](#addlistener).

#### Parameters

##### type

`"environmentalData"`

A string which specifies the type of event for which to remove an event listener.

#### Returns

`Client`

***

### removeListener()

> **removeListener**(`type`, `listener`): `Client`

Defined in: [client.ts:147](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L147)

Removes an event listener previously registered with [addListener](#addlistener).

#### Parameters

##### type

`"environmentalData"`

A string which specifies the type of event for which to remove an event listener.

##### listener

[`EnvDataHandler`](../type-aliases/EnvDataHandler.md)

The event handler to remove from the event target.

#### Returns

`Client`

***

### requestModal()

> **requestModal**(`modalRequest`): `void`

Defined in: [client.ts:444](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L444)

Asks the host application to open a modal dialog.

The modalId property names the modal that should be displayed
Data passed via the modalData property can be used by the host application to set up initial state specific to that modal

#### Parameters

##### modalRequest

[`ModalRequest`](../interfaces/ModalRequest.md)

the ID and any data specific to the modal instance required

#### Returns

`void`

***

### requestNavigation()

> **requestNavigation**(`destination`): `void`

Defined in: [client.ts:504](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L504)

Asks the host application to navigate to a new location.

By requesting navigation from the host app instead of navigating directly in the client frame,
a host-client pair can maintain a consistent browser history even if the client frame is removed
from the page in some situations. It also helps avoid any corner-case differences in how older
browsers handle iframe history

#### Parameters

##### destination

[`NavRequest`](../interfaces/NavRequest.md)

a description of where the client wants to navigate the app to.

#### Returns

`void`

***

### requestNotification()

> **requestNotification**(`notification`): `void`

Defined in: [client.ts:486](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L486)

Asks the host application to display a user notification.

The page embedding the client app is responsible for handling the fired custom event and
presenting/styling the notification.  Application-specific concerns such as level, TTLs,
ids for action callbacks (notification click, notification action buttons), etc. can be passed via
the `custom` property of the `notification` type.

#### Parameters

##### notification

[`Notification`](../interfaces/Notification.md)

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

***

### requestPromptOnLeave()

> **requestPromptOnLeave**(`messagePrompt?`): `void`

Defined in: [client.ts:514](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L514)

Asks the host application to display a prompt on leave dialog.

#### Parameters

##### messagePrompt?

`string`

#### Returns

`void`

***

### sendPageMetadata()

> **sendPageMetadata**(`metadata`): `void`

Defined in: [client.ts:540](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L540)

Sends page metadata to host for display and browser settings

title property is for the page title in the browser
breadcrumbs is an array of breadcrumb data for display in host application
custom is any custom data wanting to be sent by client app

#### Parameters

##### metadata

[`PageMetadata`](../interfaces/PageMetadata.md)

data that will be used for display in host application and browser page title

#### Returns

`void`

***

### start()

> **start**(): `void`

Defined in: [client.ts:367](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L367)

Initiates responding to events triggered by the host application.

#### Returns

`void`

***

### startInterceptingLinks()

> **startInterceptingLinks**(): `void`

Defined in: [client.ts:386](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L386)

Allows the click handler on the client window to intercept clicks on anchor elements
and makes a nav request to the host based on the element's href. This should be
avoided for complex applications as it can interfere with things like download
links that you may not want to intercept.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [client.ts:411](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L411)

Disconnects this client from the host application. This is mostly provided for
the sake of API completeness. It's unlikely to be used by most applications.

#### Returns

`void`

***

### stopInterceptingLinks()

> **stopInterceptingLinks**(): `void`

Defined in: [client.ts:393](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L393)

Turns off the behavior of intercepting link clicks in the client window click handler.

#### Returns

`void`

***

### urlFromClientPath()

> **urlFromClientPath**(`clientRoute`): `string`

Defined in: [client.ts:304](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L304)

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

***

### urlFromHostPath()

> **urlFromHostPath**(`hostRoute`): `string`

Defined in: [client.ts:320](https://github.com/purecloudlabs/iframe-coordinator/blob/b10accf0c993ccc4b2803089796a577db3e64d09/packages/iframe-coordinator/src/client.ts#L320)

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
