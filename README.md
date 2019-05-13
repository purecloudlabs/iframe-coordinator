# iframe-coordinator

Tools for coordinating independent single-page-apps embedded via iframe

## Why would I want to do that?

Iframes are the only way to obtain strong isolation of the javascript runtime in a browser. This is useful for organizations with multiple teams shipping interfaces for different features. Teams can ship with confidence, knowing errors in other's code won't crash their interface.

Embedding applications via iframe also means that code from separate teams can be deployed and rolled back independently, limiting the impact of breaking changes.

## How do I use it?

### In the host application

**JavaScript**

```js
/*
 * We require a few polyfills in order to support IE11.  These
 * will be needed to be loaded by both the host and the client.
 */
import "@babel/polyfill";
import "custom-event-polyfill/polyfill.js";
import "url-polyfill";
 
/* The iframe coordinator library uses custom elements to
 * embed itself in the host app. If you are targeting browsers
 * that don't support custom elements, you'll need a polyfill.
 * see: https://github.com/webcomponents/custom-elements for
 * more details on configuring the polyfill
 */
import "@webcomponents/custom-elements/src/native-shim.js";
import "@webcomponents/custom-elements/src/custom-elements.js";

/* Import the host library */
import { registerCustomElements } from "iframe-coordinator/host.js";

/* This will make the custome element `frame-router` available
 * for use in your browser. This element is the primary
 * host interface for the library.
 */
registerCustomElements();

/* This registers three client apps with the `frame-router`
 * element with an id of `coordinator`. `assignedRoute` is the
 * fragment path in the current page that represents the root
 * path for that client. `url` is the page to load in the
 * iframe on that route. It must be a full Url, but you can 
 * use the URL construtor to simplify handling
 * clients on the same domain. 
 * (e.g. `new URL("/client/app/path/', window.location).toString()`)
 * 
 * If the client uses fragment-based routing, the URL shoudl include a hash fragment:
 * http://example.com/client/#/
 *
 * if the client uses pushstate path-based routing, leave the fragment out:
 * e.g. http://example.com/client/
/
document.getElementById("frame-element").setupFrames({
  client1: {
    url: "https://example.com/components/example1/#/",
    assignedRoute: "/one"
  },
  client2: {
    url: "https://example.com/components/example2/#/",
    assignedRoute: "/two"
  }
}, {
  locale: 'en-US',
  hostRootUrl: window.location.origin
});
```

**HTML/DOM**

Once the `frame-router` element is rendered and the client apps configured via
`setupFrames`, navigation between and within client apps is done by changing the
element's `route` attribute. In the example below, based on the previously shown
configuration, the frame router will show show the URL at:  
https://example.com/components/example1/#/my/path

```html
<body>
    <!-- host-app stuff -->
    <frame-router id="frame-element" route="/one/my/path" />
    <!-- more host-app stuff -->
</body>
```

### In the client application

**JavaScript:**

```js
/*
 * We require a few polyfills in order to support IE11.  These
 * will be needed to be loaded by both the host and the client.
 */
import "@babel/polyfill";
import "custom-event-polyfill/polyfill.js";
import "url-polyfill";

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
### IE11 support
Our target version of javascript is ES2015.  This means that you will be required to transpile this library if you wish to support IE11.  In addition the necessary polyfills will need to be loaded by both the host application and the client frame.
