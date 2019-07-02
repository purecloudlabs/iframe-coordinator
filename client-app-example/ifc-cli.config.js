module.exports = function(frameRouter) {
  frameRouter.setupFrames(
    {
      app1: {
        url: 'http://localhost:8080/client-app-1/#/',
        assignedRoute: '/app1'
      },
      app2: {
        url: 'http://localhost:8080/client-app-2/#/',
        assignedRoute: '/app2'
      }
    },
    {
      locale: 'en-US',
      hostRootUrl: window.location.origin,
      registeredKeys: [
        'a',
        'b',
        'actrl',
        'ashift', 
        'actrlshift'
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
