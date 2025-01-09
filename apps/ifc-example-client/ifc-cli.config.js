module.exports = function (frameRouter) {
  let hostname = window.location.hostname;

  frameRouter.clientConfig = {
    clients: {
      application1: {
        url: `/clients/client-app-1/#/`,
        assignedRoute: "/app1",
      },
      application2: {
        // We are removing the built-in proxy route example for now, as there are conflicts with vite and
        // we will be adding improvements to the proxy behavior in the near future
        url: `/clients/client-app-2/#/`,
        assignedRoute: "/app2",
        allow: "camera self;", // optional
        sandbox: "allow-presentation allow-modals", // optional
        defaultTitle: "iframe Application 2 Example", // optional, but needed for accessibility
      },
      application3: {
        // We are removing the built-in proxy route example for now, as there are conflicts with vite and
        // we will be adding improvements to the proxy behavior in the near future
        url: `/clients/client-app-2/#/`,
        assignedRoute: "/app2/test",
        allow: "camera self;", // optional
        sandbox: "allow-presentation allow-modals", // optional
        defaultTitle: "iframe Application 2 Example", // optional, but needed for accessibility
      },
    },
    envData: {
      locale: "en-US",
      hostRootUrl:
        window.location.origin +
        window.location.pathname +
        window.location.search,
      registeredKeys: [
        { key: "a", ctrlKey: true },
        { key: "b", altKey: true },
        { key: "a", ctrlKey: true, shiftKey: true },
      ],
      custom: getCustomClientData(),
    },
  };
  return {
    // These are the topics that the host app should display payloads for when
    // the client publishes on them.
    publishTopics: ["publish.topic"],
  };
};

function getCustomClientData() {
  return { test: "This is only a test" };
}
