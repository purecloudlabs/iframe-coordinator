[**iframe-coordinator v6.4.0**](../README.md)

***

[iframe-coordinator](../modules.md) / client-setup

# Client Application Setup

To seamlessly integrate a client application with a host, you will need to alter the client
application's default behavior in a few ways. Detailed instructions are below. _Navigation is
the trickiest item to get correct. Be sure to read that section carefully._

## Application Bootstrap

Early in the application bootstrap process, you will need to create a [client.Client](../client/classes/Client.md) instance, add an event
listener for environment data passed from the host application, and start the client.

[Environment data](../client/interfaces/EnvData.md) is data set in the host application that is static over time, but that clients will
need to function, such as the user-selected locale. It supports both pre-defined common/required
options and custom data.

Calling [client.Client.start](../client/classes/Client.md#start) on the client sets up messaging
listeners, and sends a signal to the host application to inform it that your application is
ready to start receiving messages.

The iframe-coordinator phase of a typical client bootstrap might look like this:

```typescript
import { Client } from "iframe-coordinator/client";

let ifcClient = new Client();

// envDataHandler can be used to store the data in a service module or
// somewhere else useful for future reference
ifcClient.addListener("environmentalData", envDataHandler);

ifcClient.start();
```

## Navigation

Creating a seamless navigation experience for users is the most challenging part of iframe-embedded
applications. We need to preserve all of these experiences:

- Browser history navigation must work correctly, even if the iframe is removed from the page or
  navigates to a blank page when inactive
- Requests to open a link rendered in a client application in a new tab must open the whole
  application in the new tab, not just the client application
- Copying the link URL in a client application and sharing it with others out of band should
  result in them seeing the whole application, not just the embedded client

### Preserving Browser History

To preserve browser history, the client application should never navigate directly to a new page.
Instead, it should always request that the host application change its url. This is done with
a [client.Client.requestNavigation](../client/classes/Client.md#requestnavigation) call or by using links
with `target="_top"` set.

### Ensuring Link URLs Reference the Host Application

Links rendered by the client application should have the `href` attribute set to the full host
application URL rather than a relative path within the client. To make this easier, the client
provides the `urlFromClientPath` method that can translate
client application routes to the corresponding host application URL. The client application also provides the `urlFromHostPath` method that can translate a host application relative path to the full URL used in the host application.

### Using Custom Elements to Create Links

To further simplify the generation of these links, there are custom elements that can be used to create links. These elements are `ifc-client-link` and `ifc-host-link`. These custom elements are registered and provided by the client. These custom elements require a `path` attribute with the relative path (either client or host) that will be used to create the full URL. The `ifc-client-link` custom element uses the `urlFromClientPath` method to translate a client application route provided in the `path` attribute to a full URL. The `ifc-host-link` custom element uses the `urlFromHostPath` method to translate a host application route provided in the `path` attribute to a full URL.

### Examples

Here are some basic examples of how you might generate links or request navigation in your
application. If you are using an application framework such as Vue, Angular, etc, you may need to
wrap, extend, or avoid built-in navigation and link generation utilities.

**Programmatically Navigating**

```typescript
// Navigate to a new route in the client app: /foo/bar
ifcClient.requestNavigation({ url: ifcClient.urlFromClientPath("/foo/bar") });

// Navigate to a host application route
ifcClient.requestNavigation({ url: ifcClient.urlFromHostPath("/path") });

// Navigate to a 3rd party url
ifcClient.requestNavigation({ url: "https://external-site.com/external/path" });
```

**Generating Links**

```typescript
let internalLink = `<a href="${ifcClient.urlFromClientPath(
  "foo/bar",
)}" target="_top">Internal Link</a>`;

let hostLink = `<a href="${ifcClient.urlFromHostPath(
  "/path",
)}" target="_top">Internal Link</a>`;

let externalLink = `<a href="https://external-site.com/external/path" target="_top">Internal Link</a>`;
```

**Generating Links Using Custom Elements**

```html
<!-- Creates a link to a new route in the client app: /foo/bar -->
<ifc-client-link path="/foo/bar">Internal Link</ifc-client-link>

<!-- Creates a link to a host application route: /path -->
<ifc-host-link path="/path">Internal Link</ifc-host-link>
```

## Providing Page Metadata

When your application loads a page, you may want to provide metadata to the host application to improve the user experience. This is done with
a [client.Client.sendPageMetadata](../client/classes/Client.md#sendpagemetadata) call.

```typescript
ifcClient.sendPageMetadata({
  // The localized title for your page
  title: "My Cool Feature",
  // An array of breadcrumbs to be displayed
  breadcrumbs: [{ text: "Home", href: "/home" }],
  // Optionally, any additional data that your host expects
  custom: {
    foo: "bar",
  },
});
```

The frame-router element will emit a custom event of 'pageMetadata' with the PageMetaData object in the detail property.

## Requesting Host Actions

There are common requests a client application will want to make of a host application and we strive
to provide nice default APIs for these.

Currently there are four implemented:

[client.Client.requestNotification](../client/classes/Client.md#requestnotification), which asks the host
app to send a notification message to the user.

[client.Client.requestModal](../client/classes/Client.md#requestmodal), which asks the host
app to launch a modal identified by a given ID, also accepts initial setup data specific to that modal.

[client.Client.requestPromptOnLeave](../client/classes/Client.md#requestpromptonleave), which asks the host
app to display a prompt on leave dialog to the user before navigating.

[client.Client.clearPromptOnLeave](../client/classes/Client.md#clearpromptonleave), which asks the host
app to clear the prompt on leave dialog before navigating.

A client application may request a modal on the host like so:

```typescript
ifcClient.requestModal({
  modalType: 'idOfTheModalToDisplay',
  modalData: {
    id: '1234567890',
    userList : [{id: '2345678901', name: 'User1'}]
});
```

The frame-router element will emit a custom event of 'modalRequest' with the ModalRequest object in the detail property.

A client application may request a prompt on leave dialog on the host like so:

```typescript
ifcClient.requestPromptOnLeave();
```

The frame-router element will emit a custom event of 'promptOnLeave' with the PromptOnLeave object in the detail property.

A client application may request to clear the prompt on leave dialog on the host like so:

```typescript
ifcClient.clearPromptOnLeave();
```

The frame-router element will emit a custom event 'promptOnLeave' with the PromptOnLeave object in the detail property.

## Custom Client/Host Messaging

Client and Host applications may also need to communicate about topics specific to their use case.
iframe-coordinator provides a lightweight pub-sub wrapper around the
[postmessage api](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to meet that
need with a consistent message interface.

You can publish messages to the host application via the [client.Client.publish](../client/classes/Client.md#publish) method.

```typescript
ifcClient.publish({
  topic: "please.do.the.thing",
  payload: {
    foo: "bar",
    baz: "qux",
  },
});
```

You can listen for messages from the host on a topic via the [messaging API](../client/classes/EventEmitter.md)

```typescript
ifcClient.messaging.addEventListener("topic.from.host", payloadHandler);
```
