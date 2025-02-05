The new API should consist of two components, which have been given draft names below, but the implementing developer should feel free to make adjustments if they like:

A WorkerPool which can be initialized with environment data and a list of clients apps. This is the host side of the worker API, the equivalent to FrameRouterElement for iframes.

A WorkerClient to be used by the client app web workers to communicate with the host application. This is the client side of the worker API, equivalent to Client for iframes.

WorkerPool

The worker pool should be constructed with a configuration object similar to the one used to set up the frame router element, e.g.:

```
const workers = new WorkerPool({
  envData: {
    locale: appLocale,
    hostRootUrl: "https://apps.inindca.com/host/",
    // Optional custom data
    custom: {}
  }
  clients: {
    client1: {
      script: "https://apps.inindca.com/app/worker.js", // The worker script
      // Optional app data to allow the worker to generate URLs for an associated app
      // via client APIs like `urlFromClientPath`
      app: {
        url: "https://apps.inindca.com/app/",
        assignedRoute: "/route/to/app"
      }
    }
  }
});
```

After creation, the host app can add event listeners for events emitted from the workers that it needs to handle

workers.addEventListener('notifyRequest', showNotification)

The worker event data should be identical to the corresponding data emitted by frame router.

Once event listeners are configured, the host app calls start() to start the workers:

workers.start()

WorkerClient

This worker client API should be a subset of the current app client API. The two APIs should be able to share the majority of their implementation. The only items excluded from the worker API are those that are specific to working with the DOM or rendering individual pages.

The properties that should be present on the worker client are:

addListener

asHostUrl

publish

removeAllListeners

removeListener

requestModal

requestNavigation

requestNotification

start

stop

urlFromClientPath

urlFromHostPath

environmentData

messaging

Additionally, the client constructor will not need configuration options.

Implementation Notes

Because both the iframe and worker APIs communicate via variants of postMessage(), it should be possible to re-use a great deal of the existing code, mostly swapping out the variation in how postMessage is called. The web worker code should re-use the existing message types, as well as the version checking and validation logic for the messages.v
