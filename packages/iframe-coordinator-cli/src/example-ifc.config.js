module.exports = function(frameRouter) {
  frameRouter.clientConfig = {
    clients: {
      app1: {
        url: 'http://localhost:8080/client-app-1/#/',
        assignedRoute: '/app1'
      },
      app2: {
        url: 'http://localhost:8080/client-app-2/#/',
        assignedRoute: '/app2',
        sandbox: 'allow-presentation', // optional
        allow: 'microphone http://localhost:8080;', // optional 
        defaultTitle: 'iframe Application 2 Example' // optional, but needed for accessibility
      }
    },
    envData: {
      locale: 'en-US',
      hostRootUrl: window.location.origin,
      registeredKeys: [
        { key: 'a', ctrlKey: true },
        { key: 'b', altKey: true },
        { key: 'a', ctrlKey: true, shiftKey: true }
      ],
      custom: getCustomClientData()
    }
  };

  return {
    // These are the topics that the host app should display payloads for when
    // the client publishes on them.
    publishTopics: ['publish.topic']
  };
};

function getCustomClientData() {
  return { test: 'This is only a test' };
}
