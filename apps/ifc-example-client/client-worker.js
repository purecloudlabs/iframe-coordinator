// This module is a POC placeholder for a future IFC-integrated web-worker example

// This doesn't work because Client references HTMLElement, which doesn't exist
// in the worker context, but will work for a new worker client.
import { WorkerClient } from "iframe-coordinator/dist/workerClient.js";
// let client;
try {
  self.addEventListener("message", (e) => {
    console.log("Worker Raw Postmessage:", e);
  });

  console.log("Initializing Example Worker");

  const client = new WorkerClient();
  client.addListener("environmentalData", (envData) => {
    console.log("Worker received environment data:", envData);
  });

  client.messaging.addListener("exerciseApi", (message) => {
    const request = message.payload;
    const api = request.api;
    console.log("worker: Got exercise API request from host", request);

    if(client[api] && typeof client[api] == 'function') {
        client[api](request.data);
    } else {
      console.log(`Unrecognized API: ${api}`)
    }

  })


  console.log("Sending client start");
  client.start();
} catch (error) {
  console.error("web worker error", error);
}
