// This module is a POC placeholder for a future IFC-integrated web-worker example

// This doesn't work because Client references HTMLElement, which doesn't exist
// in the worker context, but will work for a new worker client.
// import { Client } from "iframe-coordinator/dist/client.js";

console.log("Worker Started!");
