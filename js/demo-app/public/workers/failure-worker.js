// This worker is designed to showcase worker error rate handling.

setTimeout(triggerError, getTimeout());

function triggerError() {
  // Setup the next error call, since the error will stop this function execution
  setTimeout(triggerError, getTimeout());

  console.error('Triggering an intentional error from a background worker.  Will not pop rate limit');
  foo.bar.baz();
}

function getTimeout(min=10000, max=30000) {
  return Math.max(min, Math.round(Math.random() * max));
}