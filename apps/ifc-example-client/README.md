# Client application example

This provides a basic example of how to use the iframe-coordinator client library in your app.

The app(s) are not framework based, and are intended to primarily demonstrate the features of the client.

## Running locally

The apps can be run locally as a demo embedded in the ifc-cli host. To do so you'll need to run the following
commands from the iframe-coordinator project root (the parent directory of this README):

`npm install`

`npm run build`

`npm run start-client-example`

You can then see the apps embedded in a host at http://localhost:3000/#/app1 and http://localhost:3000/#/app2

### Notes

There's no hot-reloading in development mode, so you'll need to refresh the page
after making changes. The dev mode uses a rollup watcher rather than a server like
Vite because building stand-alone web-worker modules is particularly challenging
with Vite.
