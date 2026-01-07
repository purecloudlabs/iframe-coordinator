import { WorkerClient } from "iframe-coordinator/dist/workerClient.js";

try {
  console.log("Initializing Example Worker");
  const client = new WorkerClient();

  client.addListener("environmentalData", (envData) => {
    console.log("Worker received environment data:", envData);
  });

  /**
   * Allow the ifc host to send a message to this worker, telling it to call
   * a specific `WorkerClient` API
   */
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
