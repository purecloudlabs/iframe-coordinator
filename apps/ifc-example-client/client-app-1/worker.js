console.log("worker started from app 1");
let interval = 0;
// Ask the host app to show the toast.

function doStuff() {
  interval++;
}

setInterval(doStuff, 1000);

onmessage = function (e) {
  console.log("got message", e.data);
  this.handleMessage(e.data);
  console.log(interval);
  postMessage(interval);
};

handleMessage = function (messageData) {
  switch (messageData.messageType) {
    case "envData":
      console.log("envData", messageData.message);
      break;
    default:
      console.log("cannot handle message");
  }
};
