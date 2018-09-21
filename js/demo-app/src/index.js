import "@webcomponents/custom-elements/src/native-shim.js";
import "@webcomponents/custom-elements/src/custom-elements.js";
import coordinator from "iframe-coordinator/host.js";

coordinator.registerElements();

let router = document.getElementById("router");

// Set up client URLs and Routes
router.registerClients({
  client1: {
    url: "//components/example1/",
    assignedRoute: "/one"
  },
  client2: {
    url: "//components/example2/",
    assignedRoute: "/two"
  }
});

// Subscribe to pub-sub events on the topic `publish.topic`
router.subscribe("publish.topic");

// Listen to publication events (will only be emitted for subscribed topics)
router.addEventListener("publish", event => {
  let publication = event.detail;
  console.log(
    `Recieved pub-sub data on topic ${publication.topic}:`,
    publication.payload
  );
});

document.getElementById("publish").addEventListener("click", event => {
    router.publish({
        topic: "host.topic",
        payload: { message: "Hello, Client!" }
    });
});
