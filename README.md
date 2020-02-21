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

/* This will make the custom element `frame-router` available
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
 * (e.g. `new URL('/client/app/path/', window.location).toString()`)
 *
 * If the client uses fragment-based routing, the URL should include a hash fragment:
 * http://example.com/client/#/
 *
 * if the client uses pushstate path-based routing, leave the fragment out:
 * e.g. http://example.com/client/
 */
document.getElementById("frame-element").setupFrames({
  client1: {
    url: "https://example.com/components/example1/#/",
    assignedRoute: "/one"
  },
  client2: {
    url: "https://example.com/components/example2/#/",
    assignedRoute: "/two",
    sandbox: 'allow-presentation', // optional
    allow: 'microphone https://example.com;' // optional 
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
import '@babel/polyfill';
import 'custom-event-polyfill/polyfill.js';
import 'url-polyfill';

/* Import the client library */
import { Client } from 'iframe-coordinator/client.js';

/* Create a new instance of the client */
let iframeClient = new Client({
  // This lets the example client work with the cli host by setting it's domain
  // as a valid host origin to post messages to. A production app will probably
  // need to conditionally set this.
  hostOrigin: 'http://localhost:3000'
});

// Add a listener that will handled config data passed from the host to the
// client at startup.
iframeClient.addListener('environmentalData', envData => {
  const appLocale = envData.locale;

  const now = new Date();
  const localizedDate = new Intl.DateTimeFormat(appLocale).format(now);
  console.log(
    `Got locale from host. Current date formatted for ${envData.locale} is: ${localizedDate}`
  );
  displayEnvData(envData);
});

// Listen for published events from the host on the `host.topic` topic
// and log them.
iframeClient.messaging.addListener('host.topic', publication => {
  console.log('Got Publish event:', publication);
});

// Start intercepting link click events for cross-frame routing
iframeClient.start();
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

**Local Development**

When working on a client application locally, or running automated selenium tests,
it can be burdensome to bootstrap a fully featured host-application just to work
on the client app feature. To help with this, the iframe-coordinator library also
provides a command-line utility `ifc-cli` which can spin up a local bare-bones
host application. Documentation is always available via `ifc-cli --help`:

```
Usage: ifc-cli [options]

Options:
  -f, --config-file <file>  iframe client configuration file (default: "/home/mcheely/projects/iframe-coordinator/ifc-cli.config.js")
  -p, --port <port_num>     port number to host on (default: 3000)
  -s, --ssl                 serve over https
  -h, --help                output usage information

  This program will start a server for a basic iframe-coordinator host app. In
  order to configure the frame-router element and any other custom logic needed
  in the host app, a config file must be provided which should assign a
  function to `module.exports` that will be passed the frame-router element
  as an input once it has been mounted. The function should return a config
  object with the following fields:

  - publishTopics: A list of messaging topics the client publishes on

  Keep in mind that the config file is not a true commonJS module, and
  will be evaluated directly inside the browser in an immediately invoked
  function expression.

  Here is an example config file:

module.exports = function(frameRouter) {
  frameRouter.setupFrames(
    {
      app1: {
        url: 'http://localhost:8080/client-app-1/#/',
        assignedRoute: '/app1'
      },
      app2: {
        url: 'http://localhost:8080/client-app-2/#/',
        assignedRoute: '/app2',
        sandbox: 'allow-presentation', // optional
        allow: 'microphone http://localhost:8080;' // optional 
      }
    },
    {
      locale: 'en-US',
      hostRootUrl: window.location.origin,
      custom: getCustomClientData()
    }
  );

  return {
    // These are the topics that the host app should display payloads for when
    // the client publishes on them.
    publishTopics: ['publish.topic']
  };
};

function getCustomClientData() {
  return { test: 'This is only a test' };
}
```

### Building

#### Installation
Before you can build this you will need to make sure that you are using the LTS version of nodejs. Then you can run the following command `npm ci`

#### Running the build
To run the build you can use the following command `npm run build`

#### Testing
Testing can be done in a couple different ways
```
npm run test # single run of tests
npm run test.watch # continuous run of tests
npm run test.watch.chrome # continuous run of tests in a chromium browser.
```

#### Running the example
To see an example of this in action you can run the following command `npm run start-client-example` and navigate to http://localhost:3000 on your machine.

### IE11 support

Our target version of javascript is ES2015. This means that you will be required to transpile this library if you wish to support IE11. In addition the necessary polyfills will need to be loaded by both the host application and the client frame.
