import BackgroundClient from "iframe-coordinator/BackgroundClient";
// TODO Need a better demo that makes more sense?

const client = new BackgroundClient();

// Routing example
// client.requestNavigation('/wikipedia');

let currTimeout = setTimeout(sendToastMessage, getTimeout(5000, 10000));

function sendToastMessage() {
  client.requestToast('from a Headless Worker', {
    custom: {
      level: 'info'
    },
    title: 'Hello worker World'
  });

  currTimeout = setTimeout(sendToastMessage, getTimeout());
}

// TODO - better listener from client api - with auto cleanup
addEventListener('message', evt => {
  if (evt.data.msgType === 'before_unload') {
    // Shutdown requested from host.  Clean-up and acknowledge
    if (currTimeout) {
      clearTimeout(currTimeout);
      currTimeout = null;
    }

    client.unloadReady();
  }
});

function getTimeout(min=30000, max=60000) {
  return Math.max(min, Math.round(Math.random() * max));
}