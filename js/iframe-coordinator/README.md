# iframe-coordinator

This library supports seamless embedding of multiple apps via iframes.

## Artifacts

Building the project generates two library files:

`coordinatorLib.js`

This library is used on the host app that will have other sites embedded within it. It registers a custom `iframe-coordinator` element for embedding routable client apps.

`componentLib.js`

This library is used in client apps that will be embedded in other applications. It provides an API for communication with the host application.

## Building

`npm install`

`npm run build`
