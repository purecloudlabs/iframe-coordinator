module.exports = function(frameRouter) {
  frameRouter.setupFrames(
    {
      wikip: {
        url: 'https://en.wikipedia.org/wiki/',
        assignedRoute: '/'
      }
    },
    {
      locale: 'en-US',
      hostRootUrl: window.location.origin,
      custom: getCustomClientData()
    }
  );
};

function getCustomClientData() {
  // Custom setup...
}
