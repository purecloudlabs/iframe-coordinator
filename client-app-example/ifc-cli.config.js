module.exports = function(frameRouter) {
  let hostname = window.location.hostname;

  frameRouter.setupFrames(
    {
      application1: {
        url: `http://${hostname}:8080/client-app-1/#/`,
        assignedRoute: '/app1'
      },
      application2: {
        // Instead of directly referencing client 2 via "url: `http://${hostname}:8080/client-app-2/#/`"
        // we use the built-in proxy route so it can share the same domain as the host app.
        // This is useful if you want to test host and client sharing data through localstorage or other
        // domain-restriceted APIs
        url: `${window.location.origin}/proxy/${encodeURI(
          `http://${hostname}:8080/client-app-2/#/`
        )}`,
        assignedRoute: '/app2',
        allow: 'camera http://localhost:8080;', // optional
        sandbox: 'allow-presentation allow-modals', // optional
        defaultTitle: 'iframe Application 2 Example' // optional, but needed for accessibility
      }
    },
    {
      locale: 'en-US',
      hostRootUrl: window.location.origin + '/#/',
      registeredKeys: [
        { key: 'a', ctrlKey: true },
        { key: 'b', altKey: true },
        { key: 'a', ctrlKey: true, shiftKey: true }
      ],
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
