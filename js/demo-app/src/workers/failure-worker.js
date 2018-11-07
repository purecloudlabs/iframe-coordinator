// This worker is designed to showcase worker error rate handling.
import BackgroundClient from "iframe-coordinator/BackgroundClient";

const client = new BackgroundClient();

let currTimeout = setTimeout(triggerError, getTimeout());

function triggerError() {
  // Setup the next error call, since the error will stop this function execution
  currTimeout = setTimeout(triggerError, getTimeout());

  console.error('Triggering an intentional error from a background worker.  Will not pop rate limit');
  foo.bar.baz();
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

function getTimeout(min=10000, max=30000) {
  return Math.max(min, Math.round(Math.random() * max));
}