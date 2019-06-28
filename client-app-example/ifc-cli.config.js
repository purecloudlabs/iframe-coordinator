import { Key } from '../src/Key';

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
        new Key('a').serialize(),
        new Key('b').serialize(),
        new Key('a', {ctrl: true}).serialize(),
        new Key('a', {shift: true}).serialize(), 
        new Key('a', {ctrl: true, shift: true}).serialize()
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
