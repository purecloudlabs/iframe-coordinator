# iframe-coordinator

Tools for coordinating independent single-page-apps embedded via iframe

## Why would I want to do that?

Iframes are the only way to obtain strong isolation of the javascript runtime in a browser. This is useful for organizations with multiple teams shipping interfaces for different features. Teams can ship with confidence, knowing errors in other's code won't crash their interface.

Embedding applications via iframe also means that code from separate teams can be deployed and rolled back independently, limiting the impact of breaking changes.

## How do I use it?

### In the host application

**JavaScript**

```js
/* The iframe coordinator library uses custom elements to
 * embed itself in the host app. If you are targeting browsers
 * that don't support custom elements, you'll need a polyfill.
 * see: https://github.com/webcomponents/custom-elements for
 * more details on configuring the polyfill
 */
import "@webcomponents/custom-elements/src/native-shim.js";
import "@webcomponents/custom-elements/src/custom-elements.js";

/* Import the host library */
import { registerElements } from "iframe-coordinator/host.js";

/* This will register two custom elements, `frame-router` and
 * `component-frame`. Only frame-router should be used directly.
 */
registerElements();

/* This registers three client apps with the `frame-router`
 * element with an id of `coordinator`. `assignedRoute` is the
 * fragment path in the current page that represents the root
 * path for that client. `url` is the page to load in the
 * iframe on that route. It must be a full Url, but you can 
 * use the URL construtor as shown below to simplify handling
 * clients on the same domain. In this example, the fragment
 * `#/one/my/path` would cause the `frame-router` element
 * to display the iframe at `/component/example1/#/my/path`
 */
document.getElementById("frame-element").setupFrames({
  client1: {
    url: new URL("/components/example1/", window.location).toString(),
    assignedRoute: "/one"
  },
  client2: {
    url: new URL("/components/example2/", window.location).toString(),
    assignedRoute: "/two"
  }
}, {
  locale: 'en-US',
  language: 'en-US',
  hostRootUrl: window.location.origin
});
```

**HTML/DOM**

```html
<body>
    <!-- host-app stuff -->
    <frame-router id="frame-element" />
    <!-- more host-app stuff -->
</body>
```

### In the client application

**JavaScript:**

```js
/* Import the client library */
import { Client } from "iframe-coordinator/client.js";

/* Create a new instance of the client */
const client = new Client();

/* Start intercepting links, which will prevent the
 * default link action, and instead send a message to the
 * host application to trigger routing.
 */
client.start();
```

**HTML/DOM**

```html
<body>
    <!-- ... -->
    <!--
        Links in the client app should be configured to use
        URLs that match what the host app will show, rather
        than their own internal URLs.

        We'll probably add tooling to help with this eventually.
     -->
    <a href="${hostAppUrl}/${hostAppRoute}">Click Me</a>
    <!-- ... -->
</body>
```
