# Client Application Setup

To seamlessly integrate a client application with a host, you will need to alter the client
application's default behavior in a few ways. Detailed instructions are below. _Navigation is
the trickiest item to get correct. Be sure to read that section carefully._

## Application Bootstrap

Early in the application bootstrap process, you will need to create a [client instance](../classes/client.client-1.html), add an event
listener for environment data passed from the host application, and start the client.

[Environment data](../interfaces/client.envdata.html) is data set in the host application that is static over time, but that clients will
need to function, such as the user-selected locale. It supports both pre-defined common/required
options and custom data.

Calling [`start`](../classes/client.client-1.html#start) on the client sets up messaging
listeners, and sends a signal to the host application to inform it that your application is
ready to start receiving messages.

The iframe-coordinator phase of a typical client bootstrap might look like this:

```typescript
import { Client } from 'iframe-coordinator/client';

let ifcClient = new Client();

// envDataHandler can be used to store the data in a service module or
// somewhere else useful for future reference
ifcClient.addListener('environmentalData', envDataHandler);

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
a [`requestNavigation`](../classes/client.client-1.html#requestnavigation) call or by using links
with `target="_top"` set.

### Ensuring Link URLs Reference the Host Application

Links rendered by the client application should have the `href` attribute set to the full host
application URL rather than a relative path within the client. To make this easier, the client
provides the [`asHostUrl`](../classes/client.client-1.html#ashosturl) method that can translate
client application routes to the corresponding host application URL.

### Examples

Here are some basic examples of how you might generate links or request navigation in your
application. If you are using an application framework such as Vue, Angular, etc, you may need to
wrap, extend, or avoid built-in navigation and link generation utilities.

**Programmatically Navigating**

```typescript
// Navigate to a new route in the client app: /foo/bar
ifcClient.requestNavigation({ url: ifcClient.asHostUrl('/foo/bar') });

// Navigate to a host application route
ifcClient.requestNavigation({ url: 'https://host-app.com/host/path' });

// Navigate to a 3rd party url
ifcClient.requestNavigation({ url: 'https://external-site.com/external/path' });
```

**Generating Links**

```typescript
let internalLink = `<a href="${ifcClient.asHostUrl(
  'foo/bar'
)}" target="_top">Internal Link</a>`;

let hostLink = `<a href="https://host-app.com/host/path" target="_top">Internal Link</a>`;

let externalLink = `<a href="https://external-site.com/external/path" target="_top">Internal Link</a>`;
```

## Requesting Host Actions

There are common requests a client application will want to make of a host application and we strive
to provide nice default APIs for these. Currently there is only a single api implemented:
[`requestNotification`](../classes/client.client-1.html#requestnotification), which asks the host
app to send a notification message to the user. More will be added in future releases.

## Custom Client/Host Messaging

Client and Host applications may also need to communicate about topics specific to their use case.
iframe-coordinator provides a lightweight pub-sub wrapper around the
[postmessage api](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to meet that
need with a consistent message interface.

You can publish messages to the host application via the [`publish`](../classes/client.client-1.html#publish) method.

```typescript
ifcClient.publish({
  topic: 'please.do.the.thing',
  payload: {
    foo: 'bar',
    baz: 'qux'
  }
});
```

You can listen for messages from the host on a topic via the [messaging API](../classes/client.eventemitter.html)

```typescript
ifcClient.messaging.addEventListener('topic.from.host', payloadHandler);
```
