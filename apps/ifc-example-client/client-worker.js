// This module is a POC placeholder for a future IFC-integrated web-worker example

// This doesn't work because Client references HTMLElement, which doesn't exist
// in the worker context, but will work for a new worker client.
import { WorkerClient } from "iframe-coordinator/dist/workerClient.js";
// let client;
try {
  const client = new WorkerClient();
  client.start();

  let interval = 0;
  // Ask the host app to show the toast.

  function increment() {
    interval++;
    console.log(interval);
  }

  setInterval(increment, 10000);

  onmessage = function (e) {
    console.log("got message", e.data);
    this.handleMessage(e.data);
    console.log(interval);
    postMessage(interval);
  };

  handleMessage = function (messageData) {
    switch (messageData.messageType) {
      case "env_init":
        // initializeClient(messageData)
        break;
      default:
        console.log("cannot handle message");
    }
  };

  // initializeClient = function() {

  //   // client = new WorkerClient({hostOrigin: messageData.msg.hostRootUrl})
  // }
} catch (error) {
  console.error("web worker error", error);
}
