import BackgroundClient from "iframe-coordinator/BackgroundClient";
// TODO Need a better demo that makes more sense?

const client = new BackgroundClient();

// Routing example
// client.requestNavigation('/wikipedia');

setTimeout(sendToastMessage, getTimeout(5000, 10000));

function sendToastMessage() {
  client.requestToast('from a Headless Worker', {
    custom: {
      level: 'info'
    },
    title: 'Hello worker World'
  });

  setTimeout(sendToastMessage, getTimeout());
}

function getTimeout(min=30000, max=60000) {
  return Math.max(min, Math.round(Math.random() * max));
}