[**iframe-coordinator v6.3.11**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [client](../README.md) / Client

# Class: Client

Defined in: [client.ts:21](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/client.ts#L21)

## Extends

- `BaseClient`\<`Window`\>

## Constructors

### Constructor

> **new Client**(`configOptions?`): `Client`

Defined in: [client.ts:25](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/client.ts#L25)

#### Parameters

##### configOptions?

[`ClientConfigOptions`](../interfaces/ClientConfigOptions.md)

#### Returns

`Client`

#### Overrides

`BaseClient<Window>.constructor`

## Accessors

### environmentData

#### Get Signature

> **get** **environmentData**(): `EnvData`

Defined in: [BaseClient.ts:183](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L183)

Gets the environmental data provided by the host application. This includes
the locale the client should use, the base URL of the host app, and any
custom data sent by the host.

##### Returns

`EnvData`

#### Inherited from

`BaseClient.environmentData`

***

### messaging

#### Get Signature

> **get** **messaging**(): `EventEmitter`\<`Publication`\>

Defined in: [BaseClient.ts:283](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L283)

Accessor for the general-purpose pub-sub bus between client and host applications.
The content of messages on this bus are not defined by this API beyond a basic
data wrapper of topic and payload. This is for application-specific messages
agreed upon as a shared API between host and client.

##### Returns

`EventEmitter`\<`Publication`\>

#### Inherited from

`BaseClient.messaging`

## Methods

### addListener()

> **addListener**(`type`, `listener`): `BaseClient`\<`Window`\>

Defined in: [BaseClient.ts:81](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L81)

Sets up a function that will be called whenever the specified event type is delivered to the target.
This should not be confused with the general-purpose pub-sub listeners that can be set via the
BaseClient.messaging \| messaging interface.

#### Parameters

##### type

`"environmentalData"`

A case-sensitive string representing the event type to listen for. Currently, hosts only
send `environmentalData` events.

##### listener

`EnvDataHandler`

The handler which receives a notification when an event of the specified type occurs.

#### Returns

`BaseClient`\<`Window`\>

#### Inherited from

`BaseClient.addListener`

***

### ~~asHostUrl()~~

> **asHostUrl**(`clientRouteLegacy`): `string`

Defined in: [BaseClient.ts:226](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L226)

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

`BaseClient.asHostUrl`

***

### clearPromptOnLeave()

> **clearPromptOnLeave**(): `void`

Defined in: [BaseClient.ts:401](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L401)

Asks the host application to clear the prompt on leave dialog.

#### Returns

`void`

#### Inherited from

`BaseClient.clearPromptOnLeave`

***

### publish()

> **publish**(`publication`): `void`

Defined in: [BaseClient.ts:305](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L305)

Publish a general message to the host application.

#### Parameters

##### publication

`Publication`

The data object to be published.

#### Returns

`void`

#### Inherited from

`BaseClient.publish`

***

### registerCustomElements()

> **registerCustomElements**(): `void`

Defined in: [client.ts:51](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/client.ts#L51)

Registers custom elements used by the client application

#### Returns

`void`

***

### removeAllListeners()

> **removeAllListeners**(`type`): `BaseClient`\<`Window`\>

Defined in: [BaseClient.ts:106](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L106)

Removes all event listeners previously registered with BaseClient.addListener \| addListener.

#### Parameters

##### type

`"environmentalData"`

A string which specifies the type of event for which to remove an event listener.

#### Returns

`BaseClient`\<`Window`\>

#### Inherited from

`BaseClient.removeAllListeners`

***

### removeListener()

> **removeListener**(`type`, `listener`): `BaseClient`\<`Window`\>

Defined in: [BaseClient.ts:94](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L94)

Removes an event listener previously registered with BaseClient.addListener \| addListener.

#### Parameters

##### type

`"environmentalData"`

A string which specifies the type of event for which to remove an event listener.

##### listener

`EnvDataHandler`

The event handler to remove from the event target.

#### Returns

`BaseClient`\<`Window`\>

#### Inherited from

`BaseClient.removeListener`

***

### requestModal()

> **requestModal**(`modalRequest`): `void`

Defined in: [BaseClient.ts:321](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L321)

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

`BaseClient.requestModal`

***

### requestNavigation()

> **requestNavigation**(`destination`): `void`

Defined in: [BaseClient.ts:381](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L381)

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

`BaseClient.requestNavigation`

***

### requestNotification()

> **requestNotification**(`notification`): `void`

Defined in: [BaseClient.ts:363](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L363)

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

`BaseClient.requestNotification`

***

### requestPromptOnLeave()

> **requestPromptOnLeave**(`messagePrompt?`): `void`

Defined in: [BaseClient.ts:391](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L391)

Asks the host application to display a prompt on leave dialog.

#### Parameters

##### messagePrompt?

`string`

#### Returns

`void`

#### Inherited from

`BaseClient.requestPromptOnLeave`

***

### sendPageMetadata()

> **sendPageMetadata**(`metadata`): `void`

Defined in: [BaseClient.ts:417](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L417)

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

`BaseClient.sendPageMetadata`

***

### start()

> **start**(): `void`

Defined in: [client.ts:35](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/client.ts#L35)

Initiates responding to events triggered by the host application.

#### Returns

`void`

#### Overrides

`BaseClient.start`

***

### startInterceptingLinks()

> **startInterceptingLinks**(): `void`

Defined in: [client.ts:83](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/client.ts#L83)

Allows the click handler on the client window to intercept clicks on anchor elements
and makes a nav request to the host based on the element's href. This should be
avoided for complex applications as it can interfere with things like download
links that you may not want to intercept.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [client.ts:41](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/client.ts#L41)

Disconnects this client from the host application. This is mostly provided for
the sake of API completeness. It's unlikely to be used by most applications.

#### Returns

`void`

#### Overrides

`BaseClient.stop`

***

### stopInterceptingLinks()

> **stopInterceptingLinks**(): `void`

Defined in: [client.ts:90](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/client.ts#L90)

Turns off the behavior of intercepting link clicks in the client window click handler.

#### Returns

`void`

***

### urlFromClientPath()

> **urlFromClientPath**(`clientRoute`): `string`

Defined in: [BaseClient.ts:196](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L196)

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

`BaseClient.urlFromClientPath`

***

### urlFromHostPath()

> **urlFromHostPath**(`hostRoute`): `string`

Defined in: [BaseClient.ts:212](https://github.com/purecloudlabs/iframe-coordinator/blob/561c590dfeabe11ed8488b3b06930ec2af67c347/packages/iframe-coordinator/src/BaseClient.ts#L212)

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

`BaseClient.urlFromHostPath`
