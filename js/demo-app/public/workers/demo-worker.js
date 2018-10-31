// TODO Need a better demo that makes more sense

// Routing example
// postMessage({
//   protocol: 'iframe-coordinator/workers',
//   msgType: "navRequest",
//   msg: {
//     fragment: '/wikipedia'
//   }
// });

setTimeout(sendToastMessage, getTimeout(5000, 10000));

function sendToastMessage() {
  postMessage({
    protocol: 'iframe-coordinator/workers',
    msgType: 'toastRequest',
    msg: {
      custom: {
        level: 'info'
      },
      title: 'Hello worker World',
      message: 'from a Headless Worker'
    }
  });

  setTimeout(sendToastMessage, getTimeout());
}

function getTimeout(min=30000, max=60000) {
  return Math.max(min, Math.round(Math.random() * max));
}